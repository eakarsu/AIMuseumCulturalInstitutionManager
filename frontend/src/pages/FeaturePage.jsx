import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, clearToken } from '../api';

const FEATURES = {
  collections: {
    title: 'Collections',
    icon: '🎨',
    endpoint: '/collections',
    columns: ['name', 'category', 'status', 'curator', 'total_items'],
    displayColumns: ['Name', 'Category', 'Status', 'Curator', 'Total Items'],
    fields: [
      { key: 'name', label: 'Collection Name', type: 'text', required: true },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'category', label: 'Category', type: 'select', options: ['Art','Science','History','Natural History','Photography','Sculpture','Textiles','Ceramics','Ethnography','Numismatics'] },
      { key: 'acquisition_date', label: 'Acquisition Date', type: 'date' },
      { key: 'status', label: 'Status', type: 'select', options: ['active','archived','pending'] },
      { key: 'curator', label: 'Curator', type: 'text' },
      { key: 'total_items', label: 'Total Items', type: 'number' },
    ]
  },
  objects: {
    title: 'Object Records',
    icon: '🏺',
    endpoint: '/objects',
    columns: ['title', 'artist_creator', 'medium', 'condition', 'location'],
    displayColumns: ['Title', 'Artist/Creator', 'Medium', 'Condition', 'Location'],
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'artist_creator', label: 'Artist/Creator', type: 'text' },
      { key: 'date_created', label: 'Date Created', type: 'text' },
      { key: 'medium', label: 'Medium', type: 'text' },
      { key: 'dimensions', label: 'Dimensions', type: 'text' },
      { key: 'accession_number', label: 'Accession Number', type: 'text', required: true },
      { key: 'provenance', label: 'Provenance', type: 'textarea' },
      { key: 'condition', label: 'Condition', type: 'select', options: ['Excellent','Good','Fair','Poor','Critical'] },
      { key: 'location', label: 'Location', type: 'text' },
      { key: 'collection_id', label: 'Collection ID', type: 'number' },
      { key: 'photo_url', label: 'Photo URL', type: 'text' },
      { key: 'insurance_value', label: 'Insurance Value ($)', type: 'number' },
      { key: 'description', label: 'Description', type: 'textarea' },
    ]
  },
  loans: {
    title: 'Loan Management',
    icon: '🤝',
    endpoint: '/loans',
    columns: ['institution', 'type', 'status', 'start_date', 'end_date'],
    displayColumns: ['Institution', 'Type', 'Status', 'Start Date', 'End Date'],
    fields: [
      { key: 'object_id', label: 'Object ID', type: 'number', required: true },
      { key: 'type', label: 'Type', type: 'select', options: ['incoming','outgoing'] },
      { key: 'institution', label: 'Institution', type: 'text', required: true },
      { key: 'contact_person', label: 'Contact Person', type: 'text' },
      { key: 'contact_email', label: 'Contact Email', type: 'email' },
      { key: 'start_date', label: 'Start Date', type: 'date' },
      { key: 'end_date', label: 'End Date', type: 'date' },
      { key: 'status', label: 'Status', type: 'select', options: ['pending','approved','active','returned','overdue'] },
      { key: 'insurance_value', label: 'Insurance Value ($)', type: 'number' },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ]
  },
  exhibitions: {
    title: 'Exhibitions',
    icon: '🖼️',
    endpoint: '/exhibitions',
    columns: ['title', 'curator', 'status', 'start_date', 'end_date'],
    displayColumns: ['Title', 'Curator', 'Status', 'Start Date', 'End Date'],
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'start_date', label: 'Start Date', type: 'date' },
      { key: 'end_date', label: 'End Date', type: 'date' },
      { key: 'gallery_id', label: 'Gallery ID', type: 'number' },
      { key: 'curator', label: 'Curator', type: 'text' },
      { key: 'status', label: 'Status', type: 'select', options: ['planning','upcoming','current','past','traveling'] },
      { key: 'budget', label: 'Budget ($)', type: 'number' },
      { key: 'theme', label: 'Theme', type: 'text' },
    ]
  },
  galleries: {
    title: 'Galleries',
    icon: '🏛️',
    endpoint: '/galleries',
    columns: ['name', 'wing', 'floor', 'status', 'current_exhibition'],
    displayColumns: ['Name', 'Wing', 'Floor', 'Status', 'Current Exhibition'],
    fields: [
      { key: 'name', label: 'Gallery Name', type: 'text', required: true },
      { key: 'location', label: 'Location', type: 'text' },
      { key: 'capacity', label: 'Capacity', type: 'number' },
      { key: 'square_footage', label: 'Square Footage', type: 'number' },
      { key: 'climate_controlled', label: 'Climate Controlled', type: 'select', options: ['true','false'] },
      { key: 'current_exhibition', label: 'Current Exhibition', type: 'text' },
      { key: 'status', label: 'Status', type: 'select', options: ['active','renovation','closed'] },
      { key: 'floor', label: 'Floor', type: 'number' },
      { key: 'wing', label: 'Wing', type: 'text' },
    ]
  },
  conservation: {
    title: 'Conservation',
    icon: '🔬',
    endpoint: '/conservation',
    columns: ['conservator', 'priority', 'status', 'report_date', 'condition_after'],
    displayColumns: ['Conservator', 'Priority', 'Status', 'Report Date', 'Condition After'],
    fields: [
      { key: 'object_id', label: 'Object ID', type: 'number', required: true },
      { key: 'report_date', label: 'Report Date', type: 'date' },
      { key: 'conservator', label: 'Conservator', type: 'text', required: true },
      { key: 'condition_before', label: 'Condition Before', type: 'select', options: ['Excellent','Good','Fair','Poor','Critical'] },
      { key: 'condition_after', label: 'Condition After', type: 'select', options: ['Excellent','Good','Fair','Poor','Critical'] },
      { key: 'treatment', label: 'Treatment', type: 'textarea' },
      { key: 'materials_used', label: 'Materials Used', type: 'textarea' },
      { key: 'hours_spent', label: 'Hours Spent', type: 'number' },
      { key: 'cost', label: 'Cost ($)', type: 'number' },
      { key: 'next_review', label: 'Next Review Date', type: 'date' },
      { key: 'priority', label: 'Priority', type: 'select', options: ['low','medium','high','critical'] },
      { key: 'status', label: 'Status', type: 'select', options: ['pending','in-progress','completed'] },
    ]
  },
  environment: {
    title: 'Environmental Monitoring',
    icon: '🌡️',
    endpoint: '/environment',
    columns: ['gallery_id', 'temperature', 'humidity', 'light_level', 'status'],
    displayColumns: ['Gallery ID', 'Temp (°F)', 'Humidity (%)', 'Light (lux)', 'Status'],
    fields: [
      { key: 'gallery_id', label: 'Gallery ID', type: 'number', required: true },
      { key: 'temperature', label: 'Temperature (°F)', type: 'number' },
      { key: 'humidity', label: 'Humidity (%)', type: 'number' },
      { key: 'light_level', label: 'Light Level (lux)', type: 'number' },
      { key: 'co2_level', label: 'CO2 Level (ppm)', type: 'number' },
      { key: 'status', label: 'Status', type: 'select', options: ['normal','warning','critical'] },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ]
  },
  storage: {
    title: 'Storage Locations',
    icon: '📦',
    endpoint: '/storage',
    columns: ['name', 'building', 'room', 'climate_type', 'status'],
    displayColumns: ['Name', 'Building', 'Room', 'Climate Type', 'Status'],
    fields: [
      { key: 'name', label: 'Location Name', type: 'text', required: true },
      { key: 'building', label: 'Building', type: 'text' },
      { key: 'room', label: 'Room', type: 'text' },
      { key: 'unit', label: 'Unit', type: 'text' },
      { key: 'shelf', label: 'Shelf', type: 'text' },
      { key: 'capacity', label: 'Capacity', type: 'number' },
      { key: 'current_count', label: 'Current Count', type: 'number' },
      { key: 'climate_type', label: 'Climate Type', type: 'select', options: ['ambient','cold','controlled','vault'] },
      { key: 'status', label: 'Status', type: 'select', options: ['available','full','maintenance'] },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ]
  },
  insurance: {
    title: 'Insurance & Valuation',
    icon: '🛡️',
    endpoint: '/insurance',
    columns: ['policy_number', 'provider', 'coverage_amount', 'type', 'status'],
    displayColumns: ['Policy #', 'Provider', 'Coverage ($)', 'Type', 'Status'],
    fields: [
      { key: 'object_id', label: 'Object ID', type: 'number', required: true },
      { key: 'policy_number', label: 'Policy Number', type: 'text', required: true },
      { key: 'provider', label: 'Provider', type: 'text' },
      { key: 'coverage_amount', label: 'Coverage Amount ($)', type: 'number' },
      { key: 'premium', label: 'Premium ($)', type: 'number' },
      { key: 'start_date', label: 'Start Date', type: 'date' },
      { key: 'end_date', label: 'End Date', type: 'date' },
      { key: 'type', label: 'Type', type: 'select', options: ['permanent','transit','exhibition','loan'] },
      { key: 'status', label: 'Status', type: 'select', options: ['active','expired','pending'] },
      { key: 'appraised_value', label: 'Appraised Value ($)', type: 'number' },
      { key: 'appraisal_date', label: 'Appraisal Date', type: 'date' },
    ]
  },
  ticketing: {
    title: 'Ticketing & Admissions',
    icon: '🎫',
    endpoint: '/ticketing',
    columns: ['visitor_name', 'ticket_type', 'visit_date', 'quantity', 'status'],
    displayColumns: ['Visitor', 'Type', 'Visit Date', 'Qty', 'Status'],
    fields: [
      { key: 'visitor_name', label: 'Visitor Name', type: 'text', required: true },
      { key: 'email', label: 'Email', type: 'email' },
      { key: 'visit_date', label: 'Visit Date', type: 'date' },
      { key: 'ticket_type', label: 'Ticket Type', type: 'select', options: ['adult','child','senior','student','member','group'] },
      { key: 'quantity', label: 'Quantity', type: 'number' },
      { key: 'amount', label: 'Amount ($)', type: 'number' },
      { key: 'payment_method', label: 'Payment Method', type: 'select', options: ['credit_card','debit_card','cash','online','complimentary'] },
      { key: 'status', label: 'Status', type: 'select', options: ['confirmed','used','cancelled','refunded'] },
      { key: 'exhibition_id', label: 'Exhibition ID', type: 'number' },
    ]
  },
  memberships: {
    title: 'Memberships',
    icon: '💳',
    endpoint: '/memberships',
    columns: ['member_name', 'tier', 'status', 'start_date', 'end_date'],
    displayColumns: ['Member', 'Tier', 'Status', 'Start', 'End'],
    fields: [
      { key: 'member_name', label: 'Member Name', type: 'text', required: true },
      { key: 'email', label: 'Email', type: 'email' },
      { key: 'phone', label: 'Phone', type: 'text' },
      { key: 'tier', label: 'Tier', type: 'select', options: ['Individual','Dual','Family','Patron','Benefactor',"Director's Circle"] },
      { key: 'start_date', label: 'Start Date', type: 'date' },
      { key: 'end_date', label: 'End Date', type: 'date' },
      { key: 'status', label: 'Status', type: 'select', options: ['active','expired','pending','cancelled'] },
      { key: 'benefits', label: 'Benefits', type: 'textarea' },
      { key: 'annual_fee', label: 'Annual Fee ($)', type: 'number' },
      { key: 'auto_renew', label: 'Auto Renew', type: 'select', options: ['true','false'] },
    ]
  },
  donors: {
    title: 'Donors',
    icon: '💝',
    endpoint: '/donors',
    columns: ['name', 'type', 'total_given', 'status', 'recognition_level'],
    displayColumns: ['Name', 'Type', 'Total Given ($)', 'Status', 'Recognition'],
    fields: [
      { key: 'name', label: 'Donor Name', type: 'text', required: true },
      { key: 'email', label: 'Email', type: 'email' },
      { key: 'phone', label: 'Phone', type: 'text' },
      { key: 'type', label: 'Type', type: 'select', options: ['individual','corporate','foundation','government','estate'] },
      { key: 'total_given', label: 'Total Given ($)', type: 'number' },
      { key: 'last_gift_date', label: 'Last Gift Date', type: 'date' },
      { key: 'status', label: 'Status', type: 'select', options: ['active','lapsed','prospect','major'] },
      { key: 'steward', label: 'Steward', type: 'text' },
      { key: 'notes', label: 'Notes', type: 'textarea' },
      { key: 'recognition_level', label: 'Recognition Level', type: 'text' },
    ]
  },
  giftshop: {
    title: 'Gift Shop',
    icon: '🛍️',
    endpoint: '/giftshop',
    columns: ['name', 'category', 'price', 'quantity', 'status'],
    displayColumns: ['Item', 'Category', 'Price ($)', 'Qty', 'Status'],
    fields: [
      { key: 'name', label: 'Item Name', type: 'text', required: true },
      { key: 'category', label: 'Category', type: 'select', options: ['Books','Prints','Jewelry','Souvenirs','Apparel','Stationery','Home','Children','Specialty','Accessories'] },
      { key: 'price', label: 'Price ($)', type: 'number' },
      { key: 'cost', label: 'Cost ($)', type: 'number' },
      { key: 'quantity', label: 'Quantity', type: 'number' },
      { key: 'sku', label: 'SKU', type: 'text', required: true },
      { key: 'supplier', label: 'Supplier', type: 'text' },
      { key: 'reorder_point', label: 'Reorder Point', type: 'number' },
      { key: 'status', label: 'Status', type: 'select', options: ['in-stock','low-stock','out-of-stock','discontinued'] },
      { key: 'description', label: 'Description', type: 'textarea' },
    ]
  },
  events: {
    title: 'Events',
    icon: '🎭',
    endpoint: '/events',
    columns: ['name', 'type', 'date', 'status', 'registered'],
    displayColumns: ['Event', 'Type', 'Date', 'Status', 'Registered'],
    fields: [
      { key: 'name', label: 'Event Name', type: 'text', required: true },
      { key: 'type', label: 'Type', type: 'select', options: ['gala','lecture','workshop','reception','rental','fundraiser','concert','screening','ceremony','corporate'] },
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'start_time', label: 'Start Time', type: 'time' },
      { key: 'end_time', label: 'End Time', type: 'time' },
      { key: 'location', label: 'Location', type: 'text' },
      { key: 'capacity', label: 'Capacity', type: 'number' },
      { key: 'registered', label: 'Registered', type: 'number' },
      { key: 'price', label: 'Price ($)', type: 'number' },
      { key: 'status', label: 'Status', type: 'select', options: ['upcoming','confirmed','completed','cancelled'] },
      { key: 'contact', label: 'Contact', type: 'text' },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ]
  },
  education: {
    title: 'Education Programs',
    icon: '📚',
    endpoint: '/education',
    columns: ['name', 'type', 'age_group', 'status', 'enrolled'],
    displayColumns: ['Program', 'Type', 'Age Group', 'Status', 'Enrolled'],
    fields: [
      { key: 'name', label: 'Program Name', type: 'text', required: true },
      { key: 'type', label: 'Type', type: 'select', options: ['workshop','lecture','camp','tour','class','seminar','family','teacher','outreach','online'] },
      { key: 'age_group', label: 'Age Group', type: 'text' },
      { key: 'instructor', label: 'Instructor', type: 'text' },
      { key: 'schedule', label: 'Schedule', type: 'text' },
      { key: 'capacity', label: 'Capacity', type: 'number' },
      { key: 'enrolled', label: 'Enrolled', type: 'number' },
      { key: 'fee', label: 'Fee ($)', type: 'number' },
      { key: 'status', label: 'Status', type: 'select', options: ['active','upcoming','completed','cancelled'] },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'materials', label: 'Materials', type: 'textarea' },
    ]
  },
  volunteers: {
    title: 'Volunteers',
    icon: '🙋',
    endpoint: '/volunteers',
    columns: ['name', 'role', 'status', 'hours_completed', 'availability'],
    displayColumns: ['Name', 'Role', 'Status', 'Hours', 'Availability'],
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'email', label: 'Email', type: 'email' },
      { key: 'phone', label: 'Phone', type: 'text' },
      { key: 'role', label: 'Role', type: 'select', options: ['docent','guide','greeter','shop','events','education','conservation','research','admin','security'] },
      { key: 'status', label: 'Status', type: 'select', options: ['active','inactive','training','on-leave'] },
      { key: 'start_date', label: 'Start Date', type: 'date' },
      { key: 'hours_completed', label: 'Hours Completed', type: 'number' },
      { key: 'availability', label: 'Availability', type: 'text' },
      { key: 'skills', label: 'Skills', type: 'textarea' },
      { key: 'certifications', label: 'Certifications', type: 'textarea' },
    ]
  },
  tours: {
    title: 'Tours',
    icon: '🗺️',
    endpoint: '/tours',
    columns: ['name', 'type', 'date', 'status', 'booked'],
    displayColumns: ['Tour', 'Type', 'Date', 'Status', 'Booked'],
    fields: [
      { key: 'name', label: 'Tour Name', type: 'text', required: true },
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'time', label: 'Time', type: 'time' },
      { key: 'guide_id', label: 'Guide ID', type: 'number' },
      { key: 'type', label: 'Type', type: 'select', options: ['general','school','VIP','private','accessibility','behind-scenes','family','photography','curator-led','virtual'] },
      { key: 'capacity', label: 'Capacity', type: 'number' },
      { key: 'booked', label: 'Booked', type: 'number' },
      { key: 'duration', label: 'Duration (min)', type: 'number' },
      { key: 'price', label: 'Price ($)', type: 'number' },
      { key: 'status', label: 'Status', type: 'select', options: ['available','full','completed','cancelled'] },
      { key: 'language', label: 'Language', type: 'text' },
      { key: 'meeting_point', label: 'Meeting Point', type: 'text' },
    ]
  },
  visitors: {
    title: 'Visitor Analytics',
    icon: '📊',
    endpoint: '/visitors',
    columns: ['date', 'total_visitors', 'revenue', 'satisfaction_score', 'peak_hour'],
    displayColumns: ['Date', 'Total Visitors', 'Revenue ($)', 'Satisfaction', 'Peak Hour'],
    fields: [
      { key: 'date', label: 'Date', type: 'date', required: true },
      { key: 'total_visitors', label: 'Total Visitors', type: 'number' },
      { key: 'members', label: 'Members', type: 'number' },
      { key: 'adults', label: 'Adults', type: 'number' },
      { key: 'children', label: 'Children', type: 'number' },
      { key: 'seniors', label: 'Seniors', type: 'number' },
      { key: 'students', label: 'Students', type: 'number' },
      { key: 'groups', label: 'Groups', type: 'number' },
      { key: 'peak_hour', label: 'Peak Hour', type: 'text' },
      { key: 'avg_duration', label: 'Avg Duration (hrs)', type: 'number' },
      { key: 'top_exhibition', label: 'Top Exhibition', type: 'text' },
      { key: 'satisfaction_score', label: 'Satisfaction Score', type: 'number' },
      { key: 'revenue', label: 'Revenue ($)', type: 'number' },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ]
  },
  security: {
    title: 'Security Rounds',
    icon: '🔒',
    endpoint: '/security',
    columns: ['officer', 'zone', 'date', 'status', 'incidents'],
    displayColumns: ['Officer', 'Zone', 'Date', 'Status', 'Incidents'],
    fields: [
      { key: 'officer', label: 'Officer', type: 'text', required: true },
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'start_time', label: 'Start Time', type: 'time' },
      { key: 'end_time', label: 'End Time', type: 'time' },
      { key: 'zone', label: 'Zone', type: 'text' },
      { key: 'status', label: 'Status', type: 'select', options: ['completed','in-progress','scheduled','incident'] },
      { key: 'findings', label: 'Findings', type: 'textarea' },
      { key: 'incidents', label: 'Incidents', type: 'number' },
      { key: 'doors_checked', label: 'Doors Checked', type: 'number' },
      { key: 'cameras_reviewed', label: 'Cameras Reviewed', type: 'number' },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ]
  },
  maintenance: {
    title: 'Maintenance',
    icon: '🔧',
    endpoint: '/maintenance',
    columns: ['title', 'type', 'priority', 'status', 'assigned_to'],
    displayColumns: ['Title', 'Type', 'Priority', 'Status', 'Assigned To'],
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'location', label: 'Location', type: 'text' },
      { key: 'type', label: 'Type', type: 'select', options: ['HVAC','Plumbing','Electrical','Structural','Cleaning','Painting','Landscaping','Fire Safety','Elevator','IT'] },
      { key: 'priority', label: 'Priority', type: 'select', options: ['low','medium','high','urgent'] },
      { key: 'status', label: 'Status', type: 'select', options: ['open','in-progress','completed','deferred'] },
      { key: 'reported_by', label: 'Reported By', type: 'text' },
      { key: 'assigned_to', label: 'Assigned To', type: 'text' },
      { key: 'reported_date', label: 'Reported Date', type: 'date' },
      { key: 'completed_date', label: 'Completed Date', type: 'date' },
      { key: 'cost', label: 'Cost ($)', type: 'number' },
      { key: 'description', label: 'Description', type: 'textarea' },
    ]
  },
};

const CURRENCY_FIELDS = ['amount', 'price', 'cost', 'fee', 'premium', 'budget', 'revenue', 'total_given', 'coverage_amount', 'insurance_value', 'appraised_value', 'annual_fee'];
const STATUS_FIELDS = ['status', 'priority', 'condition', 'tier', 'type'];

function formatValue(key, value) {
  if (value === null || value === undefined || value === '') return '\u2014';
  if (value === true || value === 'true') return 'Yes';
  if (value === false || value === 'false') return 'No';
  if (key.includes('date') && value) {
    try {
      const d = new Date(value);
      if (!isNaN(d)) return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch { /* ignore */ }
  }
  if (CURRENCY_FIELDS.includes(key)) {
    return `$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  }
  return String(value);
}

function formatDateForInput(value) {
  if (!value) return '';
  try {
    const d = new Date(value);
    if (!isNaN(d)) return d.toISOString().split('T')[0];
  } catch { /* ignore */ }
  return value;
}

const PAGINATED_FEATURES = new Set(['collections', 'objects', 'exhibitions', 'loans']);

export default function FeaturePage() {
  const { feature } = useParams();
  const navigate = useNavigate();
  const config = FEATURES[feature];

  const [items, setItems] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = useCallback(async (p = 1) => {
    if (!config) return;
    setLoading(true);
    setError('');
    try {
      const isPaginated = PAGINATED_FEATURES.has(feature);
      const url = isPaginated ? `${config.endpoint}?page=${p}&limit=20` : config.endpoint;
      const data = await api.get(url);
      if (isPaginated && data.data) {
        setItems(data.data);
        setFiltered(data.data);
        setTotalPages(data.totalPages || 1);
      } else {
        const rows = Array.isArray(data) ? data : (data.data || []);
        setItems(rows);
        setFiltered(rows);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [feature]);

  useEffect(() => {
    if (config) {
      setPage(1);
      setTotalPages(1);
      fetchData(1);
      setSearch('');
      setShowDetail(false);
      setShowForm(false);
    }
  }, [feature]);

  useEffect(() => {
    if (page > 1) fetchData(page);
  }, [page]);

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(items);
      return;
    }
    const q = search.toLowerCase();
    setFiltered(items.filter(item =>
      config.columns.some(col => {
        const val = item[col];
        return val && String(val).toLowerCase().includes(q);
      })
    ));
  }, [search, items]);

  if (!config) {
    navigate('/');
    return null;
  }

  async function handleCreate(e) {
    e.preventDefault();
    try {
      await api.post(config.endpoint, formData);
      setShowForm(false);
      setFormData({});
      fetchData(page);
    } catch (err) {
      alert('Error creating item: ' + err.message);
    }
  }

  async function handleUpdate(e) {
    e.preventDefault();
    try {
      await api.put(`${config.endpoint}/${editItem.id}`, formData);
      setShowForm(false);
      setEditItem(null);
      setFormData({});
      fetchData(page);
    } catch (err) {
      alert('Error updating item: ' + err.message);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await api.delete(`${config.endpoint}/${id}`);
      setShowDetail(false);
      setSelectedItem(null);
      fetchData(page);
    } catch (err) {
      alert('Error deleting item: ' + err.message);
    }
  }

  function openCreate() {
    setEditItem(null);
    setFormData({});
    setShowForm(true);
  }

  function openEdit(item) {
    setEditItem(item);
    const data = {};
    config.fields.forEach(f => {
      let val = item[f.key];
      if (f.type === 'date') val = formatDateForInput(val);
      data[f.key] = val ?? '';
    });
    setFormData(data);
    setShowForm(true);
    setShowDetail(false);
  }

  function openDetail(item) {
    setSelectedItem(item);
    setShowDetail(true);
  }

  function handleFieldChange(key, value) {
    setFormData(prev => ({ ...prev, [key]: value }));
  }

  function renderFormField(field) {
    const value = formData[field.key] ?? '';
    if (field.type === 'select') {
      return (
        <select
          className="form-input"
          value={value}
          onChange={e => handleFieldChange(field.key, e.target.value)}
          required={field.required}
        >
          <option value="">Select {field.label}</option>
          {field.options.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      );
    }
    if (field.type === 'textarea') {
      return (
        <textarea
          className="form-input"
          value={value}
          onChange={e => handleFieldChange(field.key, e.target.value)}
          rows={3}
          required={field.required}
        />
      );
    }
    return (
      <input
        type={field.type}
        className="form-input"
        value={value}
        onChange={e => handleFieldChange(field.key, e.target.value)}
        required={field.required}
        step={field.type === 'number' ? 'any' : undefined}
      />
    );
  }

  return (
    <div className="feature-page">
      <nav className="nav-bar">
        <div className="nav-brand" onClick={() => navigate('/')}>🏛️ Museum Manager</div>
        <div className="nav-title">{config.icon} {config.title}</div>
        <div className="nav-actions">
          <button className="btn btn-sm" onClick={() => { clearToken(); navigate('/login'); }}>Logout</button>
        </div>
      </nav>

      <div className="page-header">
        <div>
          <div className="breadcrumb">
            <span onClick={() => navigate('/')} style={{ cursor: 'pointer', color: 'var(--gold)' }}>Dashboard</span>
            <span> / {config.title}</span>
          </div>
          <h1>{config.icon} {config.title}</h1>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ New Item</button>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder={`Search ${config.title.toLowerCase()}...`}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="empty-state">Loading...</div>
      ) : error ? (
        <div className="empty-state" style={{ color: 'var(--danger)' }}>{error}</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                {config.displayColumns.map((col, i) => <th key={i}>{col}</th>)}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={config.columns.length + 1}>
                    <div className="empty-state">No items found</div>
                  </td>
                </tr>
              ) : filtered.map((item, idx) => (
                <tr key={item.id} onClick={() => openDetail(item)} style={{ cursor: 'pointer' }}>
                  <td>{idx + 1}</td>
                  {config.columns.map(col => (
                    <td key={col}>
                      {STATUS_FIELDS.includes(col) && item[col] ? (
                        <span className={`status-badge ${String(item[col]).toLowerCase().replace(/[^a-z0-9]/g, '-')}`}>
                          {item[col]}
                        </span>
                      ) : formatValue(col, item[col])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {PAGINATED_FEATURES.has(feature) && totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, padding: '20px 0' }}>
          <button
            disabled={page <= 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            className="btn btn-secondary"
            style={{ opacity: page <= 1 ? 0.4 : 1 }}
          >
            Prev
          </button>
          <span style={{ color: 'var(--gold)', fontSize: 14 }}>Page {page} of {totalPages}</span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage(p => p + 1)}
            className="btn btn-secondary"
            style={{ opacity: page >= totalPages ? 0.4 : 1 }}
          >
            Next
          </button>
        </div>
      )}

      {showDetail && selectedItem && (
        <div className="modal-overlay" onClick={() => setShowDetail(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{config.icon} Detail View</h2>
              <button className="btn btn-sm" onClick={() => setShowDetail(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-field">
                  <div className="detail-label">ID</div>
                  <div className="detail-value">{selectedItem.id}</div>
                </div>
                {config.fields.map(field => (
                  <div className="detail-field" key={field.key}>
                    <div className="detail-label">{field.label}</div>
                    <div className="detail-value">{formatValue(field.key, selectedItem[field.key])}</div>
                  </div>
                ))}
                {selectedItem.created_at && (
                  <div className="detail-field">
                    <div className="detail-label">Created</div>
                    <div className="detail-value">{new Date(selectedItem.created_at).toLocaleString()}</div>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => openEdit(selectedItem)}>Edit</button>
              <button className="btn btn-danger" onClick={() => handleDelete(selectedItem.id)}>Delete</button>
              <button className="btn btn-secondary" onClick={() => setShowDetail(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editItem ? 'Edit' : 'New'} {config.title.replace(/s$/, '')}</h2>
              <button className="btn btn-sm" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <form onSubmit={editItem ? handleUpdate : handleCreate}>
              <div className="modal-body">
                {config.fields.map(field => (
                  <div className="form-group" key={field.key}>
                    <label>{field.label}{field.required && ' *'}</label>
                    {renderFormField(field)}
                  </div>
                ))}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editItem ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
