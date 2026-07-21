import crypto from 'node:crypto';

const TRANSITIONS=Object.freeze({
  requested:new Set(['validated','rejected']),validated:new Set(['approval_pending','exception','rejected']),
  approval_pending:new Set(['approved','rejected']),approved:new Set(['packed','cancelled']),
  packed:new Set(['in_transit','exception']),in_transit:new Set(['on_loan','exception']),
  on_loan:new Set(['return_inspection','exception']),return_inspection:new Set(['closed','exception']),
  exception:new Set(['validated','cancelled']),closed:new Set(),rejected:new Set(),cancelled:new Set(),
});
function stable(value){if(Array.isArray(value))return value.map(stable);if(!value||typeof value!=='object')return value;return Object.fromEntries(Object.keys(value).sort().map((key)=>[key,stable(value[key])]));}
export function digest(value){return crypto.createHash('sha256').update(JSON.stringify(stable(value))).digest('hex');}

export function validateLoanRequest(request){
  const errors=[];
  for(const field of ['tenantId','objectId','borrowingInstitutionId','startDate','endDate','conditionReportDigest','provenanceDecisionId','insuranceCertificateId'])if(!String(request?.[field]||'').trim())errors.push(`${field} is required`);
  if(request?.conditionReportDigest&&!/^[a-f0-9]{64}$/.test(request.conditionReportDigest))errors.push('conditionReportDigest must be SHA-256');
  if(request?.provenanceCleared!==true)errors.push('documented provenance clearance is required');
  if(request?.ownershipAuthorityConfirmed!==true)errors.push('ownership or custody authority must be confirmed');
  if(request?.facilityReportAccepted!==true)errors.push('borrowing facility report must be accepted');
  if(request?.transportPlan?.climateControl!==true||request?.transportPlan?.securityEscort!==true)errors.push('climate-controlled transport and security escort are required');
  const start=Date.parse(request?.startDate),end=Date.parse(request?.endDate);
  if(!Number.isFinite(start)||!Number.isFinite(end)||end<=start)errors.push('loan dates must form a positive interval');
  return {ok:errors.length===0,errors,evidenceDigest:digest(request)};
}

export function authorizeLoanTransition({current,next,actor,approvals=[],adaptersReady=false,evidence}){
  const errors=[];
  if(!TRANSITIONS[current]?.has(next))errors.push(`transition ${current} -> ${next} is not allowed`);
  const role=actor?.role;
  if(!['registrar','curator','conservator','security','approver','auditor','admin'].includes(role))errors.push('recognized museum role is required');
  if(['validated','approval_pending'].includes(next)&&!['registrar','admin'].includes(role))errors.push('registrar role is required');
  if(next==='approved'){
    if(!['approver','admin'].includes(role))errors.push('approver role is required');
    const approvedRoles=new Set(approvals.filter((item)=>item.decision==='approve').map((item)=>item.approvalRole));
    if(!approvedRoles.has('registrar')||!approvedRoles.has('conservator'))errors.push('registrar and conservator approvals are required');
  }
  if(['packed','in_transit','on_loan'].includes(next)&&(!adaptersReady||!evidence?.conditionDigest))errors.push('ready adapters and condition evidence are required');
  if(next==='closed'&&(!['registrar','auditor','admin'].includes(role)||!evidence?.returnConditionDigest||!evidence?.custodyReceipt))errors.push('return condition and custody evidence are required');
  return {ok:errors.length===0,errors,evidenceDigest:evidence?digest(evidence):null};
}

const ALLOWED_SCOPES=new Set(['interests','accessibility','language']);
export function validateVisitorConsent(consent,now=new Date()){
  const errors=[];
  if(!String(consent?.visitorPseudonym||'').trim())errors.push('visitor pseudonym is required');
  if(consent?.purpose!=='visitor_experience')errors.push('purpose must be visitor_experience');
  if(!Array.isArray(consent?.scopes)||!consent.scopes.length||consent.scopes.some((scope)=>!ALLOWED_SCOPES.has(scope)))errors.push('only explicit interests, accessibility, and language scopes are allowed');
  const expiry=Date.parse(consent?.expiresAt);
  if(!Number.isFinite(expiry)||expiry<=now.getTime())errors.push('consent expiry must be in the future');
  if(consent?.revoked===true)errors.push('revoked consent cannot be used');
  if(consent?.profile&&Object.keys(consent.profile).some((key)=>['race','religion','health','biometric','politics','sexualOrientation','preciseLocation'].includes(key)))errors.push('sensitive or protected traits are prohibited');
  return {ok:errors.length===0,errors,consentDigest:digest(consent)};
}

export function personalizeVisit({consent,exhibits,catalogVersion}){
  const validation=validateVisitorConsent(consent);
  if(!validation.ok)throw new Error(validation.errors.join('; '));
  if(!String(catalogVersion||'').trim()||!Array.isArray(exhibits))throw new Error('versioned exhibit catalog is required');
  const interests=new Set(consent.profile?.interests||[]),needs=new Set(consent.profile?.accessibility||[]),languages=new Set(consent.profile?.languages||[]);
  const recommendations=exhibits.map((exhibit)=>{
    let score=0;const reasons=[];
    for(const tag of exhibit.tags||[])if(interests.has(tag)){score+=3;reasons.push(`interest:${tag}`);}
    for(const feature of exhibit.accessibility||[])if(needs.has(feature)){score+=2;reasons.push(`accessibility:${feature}`);}
    for(const language of exhibit.languages||[])if(languages.has(language)){score+=1;reasons.push(`language:${language}`);}
    return {exhibitId:exhibit.id,score,reasons};
  }).filter((item)=>item.score>0).sort((a,b)=>b.score-a.score||String(a.exhibitId).localeCompare(String(b.exhibitId)));
  return {catalogVersion,consentDigest:validation.consentDigest,recommendations,automaticallyActioned:false,evidenceDigest:digest({catalogVersion,recommendations})};
}

export function evaluateAcceptance(samples){
  if(!Array.isArray(samples)||!samples.length)throw new Error('versioned acceptance samples are required');
  const latencies=samples.map((sample)=>Number(sample.latencyMs));
  if(latencies.some((value)=>!Number.isFinite(value)||value<0))throw new Error('latency must be non-negative');
  const sorted=[...latencies].sort((a,b)=>a-b);
  return {sampleCount:samples.length,correctness:samples.filter((sample)=>sample.correct===true).length/samples.length,failureRecovery:samples.filter((sample)=>sample.failureInjected===true).length?samples.filter((sample)=>sample.failureInjected===true&&sample.recovered===true).length/samples.filter((sample)=>sample.failureInjected===true).length:1,latencyP95Ms:sorted[Math.min(sorted.length-1,Math.ceil(sorted.length*.95)-1)],realWorldOutcomeRate:samples.filter((sample)=>sample.outcomeMet===true).length/samples.length};
}
export {TRANSITIONS};
