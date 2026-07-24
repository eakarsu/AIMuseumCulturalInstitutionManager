import pg from 'pg';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

function requireDemoPassword() {
  const password = process.env.DEMO_PASSWORD || process.env.SEED_DEMO_PASSWORD || process.env.DEMO_SEED_PASSWORD || '';
  if (password.length < 12 || password.length > 1024) throw new Error('DEMO_PASSWORD must contain 12-1024 characters');
  return password;
}

async function seed() {
  const client = await pool.connect();

  try {
    console.log('Dropping all tables...');
    await client.query(`
      DROP TABLE IF EXISTS security_rounds CASCADE;
      DROP TABLE IF EXISTS maintenance_requests CASCADE;
      DROP TABLE IF EXISTS visitor_analytics CASCADE;
      DROP TABLE IF EXISTS tours CASCADE;
      DROP TABLE IF EXISTS volunteers CASCADE;
      DROP TABLE IF EXISTS education_programs CASCADE;
      DROP TABLE IF EXISTS events CASCADE;
      DROP TABLE IF EXISTS gift_shop_items CASCADE;
      DROP TABLE IF EXISTS donors CASCADE;
      DROP TABLE IF EXISTS memberships CASCADE;
      DROP TABLE IF EXISTS tickets CASCADE;
      DROP TABLE IF EXISTS insurance_records CASCADE;
      DROP TABLE IF EXISTS storage_locations CASCADE;
      DROP TABLE IF EXISTS environment_logs CASCADE;
      DROP TABLE IF EXISTS conservation CASCADE;
      DROP TABLE IF EXISTS loans CASCADE;
      DROP TABLE IF EXISTS objects CASCADE;
      DROP TABLE IF EXISTS exhibitions CASCADE;
      DROP TABLE IF EXISTS galleries CASCADE;
      DROP TABLE IF EXISTS collections CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
    `);

    console.log('Creating tables...');

    // 1. users
    await client.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        email VARCHAR UNIQUE NOT NULL,
        password VARCHAR NOT NULL,
        name VARCHAR NOT NULL,
        role VARCHAR NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // 2. collections
    await client.query(`
      CREATE TABLE collections (
        id SERIAL PRIMARY KEY,
        name VARCHAR NOT NULL,
        description TEXT,
        category VARCHAR NOT NULL,
        acquisition_date DATE,
        status VARCHAR NOT NULL,
        curator VARCHAR,
        total_items INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // 3. galleries
    await client.query(`
      CREATE TABLE galleries (
        id SERIAL PRIMARY KEY,
        name VARCHAR NOT NULL,
        location VARCHAR,
        capacity INT,
        square_footage INT,
        climate_controlled BOOLEAN DEFAULT false,
        current_exhibition VARCHAR,
        status VARCHAR NOT NULL,
        floor INT,
        wing VARCHAR,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // 4. objects
    await client.query(`
      CREATE TABLE objects (
        id SERIAL PRIMARY KEY,
        title VARCHAR NOT NULL,
        artist_creator VARCHAR,
        date_created VARCHAR,
        medium VARCHAR,
        dimensions VARCHAR,
        accession_number VARCHAR UNIQUE NOT NULL,
        provenance TEXT,
        condition VARCHAR,
        location VARCHAR,
        collection_id INT REFERENCES collections(id),
        photo_url VARCHAR,
        insurance_value DECIMAL,
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // 5. exhibitions
    await client.query(`
      CREATE TABLE exhibitions (
        id SERIAL PRIMARY KEY,
        title VARCHAR NOT NULL,
        description TEXT,
        start_date DATE,
        end_date DATE,
        gallery_id INT,
        curator VARCHAR,
        status VARCHAR NOT NULL,
        budget DECIMAL,
        theme VARCHAR,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // 6. loans
    await client.query(`
      CREATE TABLE loans (
        id SERIAL PRIMARY KEY,
        object_id INT REFERENCES objects(id),
        type VARCHAR NOT NULL,
        institution VARCHAR,
        contact_person VARCHAR,
        contact_email VARCHAR,
        start_date DATE,
        end_date DATE,
        status VARCHAR NOT NULL,
        insurance_value DECIMAL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // 7. conservation
    await client.query(`
      CREATE TABLE conservation (
        id SERIAL PRIMARY KEY,
        object_id INT REFERENCES objects(id),
        report_date DATE,
        conservator VARCHAR,
        condition_before VARCHAR,
        condition_after VARCHAR,
        treatment TEXT,
        materials_used TEXT,
        hours_spent DECIMAL,
        cost DECIMAL,
        next_review DATE,
        priority VARCHAR,
        status VARCHAR NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // 8. environment_logs
    await client.query(`
      CREATE TABLE environment_logs (
        id SERIAL PRIMARY KEY,
        gallery_id INT REFERENCES galleries(id),
        timestamp TIMESTAMP DEFAULT NOW(),
        temperature DECIMAL,
        humidity DECIMAL,
        light_level DECIMAL,
        co2_level DECIMAL,
        status VARCHAR,
        notes TEXT
      );
    `);

    // 9. storage_locations
    await client.query(`
      CREATE TABLE storage_locations (
        id SERIAL PRIMARY KEY,
        name VARCHAR NOT NULL,
        building VARCHAR,
        room VARCHAR,
        unit VARCHAR,
        shelf VARCHAR,
        capacity INT,
        current_count INT DEFAULT 0,
        climate_type VARCHAR,
        status VARCHAR NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // 10. insurance_records
    await client.query(`
      CREATE TABLE insurance_records (
        id SERIAL PRIMARY KEY,
        object_id INT REFERENCES objects(id),
        policy_number VARCHAR,
        provider VARCHAR,
        coverage_amount DECIMAL,
        premium DECIMAL,
        start_date DATE,
        end_date DATE,
        type VARCHAR,
        status VARCHAR NOT NULL,
        appraised_value DECIMAL,
        appraisal_date DATE,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // 11. tickets
    await client.query(`
      CREATE TABLE tickets (
        id SERIAL PRIMARY KEY,
        visitor_name VARCHAR NOT NULL,
        email VARCHAR,
        visit_date DATE,
        ticket_type VARCHAR NOT NULL,
        quantity INT DEFAULT 1,
        amount DECIMAL,
        payment_method VARCHAR,
        status VARCHAR NOT NULL,
        exhibition_id INT REFERENCES exhibitions(id),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // 12. memberships
    await client.query(`
      CREATE TABLE memberships (
        id SERIAL PRIMARY KEY,
        member_name VARCHAR NOT NULL,
        email VARCHAR,
        phone VARCHAR,
        tier VARCHAR NOT NULL,
        start_date DATE,
        end_date DATE,
        status VARCHAR NOT NULL,
        benefits TEXT,
        annual_fee DECIMAL,
        auto_renew BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // 13. donors
    await client.query(`
      CREATE TABLE donors (
        id SERIAL PRIMARY KEY,
        name VARCHAR NOT NULL,
        email VARCHAR,
        phone VARCHAR,
        type VARCHAR NOT NULL,
        total_given DECIMAL DEFAULT 0,
        last_gift_date DATE,
        status VARCHAR NOT NULL,
        steward VARCHAR,
        notes TEXT,
        recognition_level VARCHAR,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // 14. gift_shop_items
    await client.query(`
      CREATE TABLE gift_shop_items (
        id SERIAL PRIMARY KEY,
        name VARCHAR NOT NULL,
        category VARCHAR NOT NULL,
        price DECIMAL,
        cost DECIMAL,
        quantity INT DEFAULT 0,
        sku VARCHAR UNIQUE NOT NULL,
        supplier VARCHAR,
        reorder_point INT DEFAULT 10,
        status VARCHAR NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // 15. events
    await client.query(`
      CREATE TABLE events (
        id SERIAL PRIMARY KEY,
        name VARCHAR NOT NULL,
        type VARCHAR NOT NULL,
        date DATE,
        start_time TIME,
        end_time TIME,
        location VARCHAR,
        capacity INT,
        registered INT DEFAULT 0,
        price DECIMAL,
        status VARCHAR NOT NULL,
        contact VARCHAR,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // 16. education_programs
    await client.query(`
      CREATE TABLE education_programs (
        id SERIAL PRIMARY KEY,
        name VARCHAR NOT NULL,
        type VARCHAR NOT NULL,
        age_group VARCHAR,
        instructor VARCHAR,
        schedule VARCHAR,
        capacity INT,
        enrolled INT DEFAULT 0,
        fee DECIMAL,
        status VARCHAR NOT NULL,
        description TEXT,
        materials TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // 17. volunteers
    await client.query(`
      CREATE TABLE volunteers (
        id SERIAL PRIMARY KEY,
        name VARCHAR NOT NULL,
        email VARCHAR,
        phone VARCHAR,
        role VARCHAR NOT NULL,
        status VARCHAR NOT NULL,
        start_date DATE,
        hours_completed DECIMAL DEFAULT 0,
        availability VARCHAR,
        skills TEXT,
        certifications TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // 18. tours
    await client.query(`
      CREATE TABLE tours (
        id SERIAL PRIMARY KEY,
        name VARCHAR NOT NULL,
        date DATE,
        time TIME,
        guide_id INT REFERENCES volunteers(id),
        type VARCHAR NOT NULL,
        capacity INT,
        booked INT DEFAULT 0,
        duration INT,
        price DECIMAL,
        status VARCHAR NOT NULL,
        language VARCHAR DEFAULT 'English',
        meeting_point VARCHAR,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // 19. visitor_analytics
    await client.query(`
      CREATE TABLE visitor_analytics (
        id SERIAL PRIMARY KEY,
        date DATE,
        total_visitors INT,
        members INT,
        adults INT,
        children INT,
        seniors INT,
        students INT,
        groups INT,
        peak_hour VARCHAR,
        avg_duration DECIMAL,
        top_exhibition VARCHAR,
        satisfaction_score DECIMAL,
        revenue DECIMAL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // 20. security_rounds
    await client.query(`
      CREATE TABLE security_rounds (
        id SERIAL PRIMARY KEY,
        officer VARCHAR NOT NULL,
        date DATE,
        start_time TIME,
        end_time TIME,
        zone VARCHAR,
        status VARCHAR NOT NULL,
        findings TEXT,
        incidents INT DEFAULT 0,
        doors_checked INT DEFAULT 0,
        cameras_reviewed INT DEFAULT 0,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // 21. maintenance_requests
    await client.query(`
      CREATE TABLE maintenance_requests (
        id SERIAL PRIMARY KEY,
        title VARCHAR NOT NULL,
        location VARCHAR,
        type VARCHAR NOT NULL,
        priority VARCHAR NOT NULL,
        status VARCHAR NOT NULL,
        reported_by VARCHAR,
        assigned_to VARCHAR,
        reported_date DATE,
        completed_date DATE,
        cost DECIMAL,
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log('All tables created. Seeding data...');

    // ── SEED USERS ──
    const hashedPassword = await bcrypt.hash(requireDemoPassword(), 10);
    const usersValues = [
      ['admin@museum.org', hashedPassword, 'Admin User', 'admin'],
      ['sarah.mitchell@museum.org', hashedPassword, 'Sarah Mitchell', 'staff'],
      ['james.chen@museum.org', hashedPassword, 'James Chen', 'staff'],
      ['maria.gonzalez@museum.org', hashedPassword, 'Maria Gonzalez', 'staff'],
      ['david.thompson@museum.org', hashedPassword, 'David Thompson', 'staff'],
      ['emily.watson@museum.org', hashedPassword, 'Emily Watson', 'staff'],
      ['robert.kim@museum.org', hashedPassword, 'Robert Kim', 'staff'],
      ['lisa.patel@museum.org', hashedPassword, 'Lisa Patel', 'staff'],
      ['michael.brown@museum.org', hashedPassword, 'Michael Brown', 'staff'],
      ['jennifer.davis@museum.org', hashedPassword, 'Jennifer Davis', 'staff'],
      ['william.garcia@museum.org', hashedPassword, 'William Garcia', 'staff'],
      ['amanda.foster@museum.org', hashedPassword, 'Amanda Foster', 'volunteer'],
      ['christopher.lee@museum.org', hashedPassword, 'Christopher Lee', 'volunteer'],
      ['patricia.wang@museum.org', hashedPassword, 'Patricia Wang', 'volunteer'],
      ['daniel.martinez@museum.org', hashedPassword, 'Daniel Martinez', 'staff'],
      ['nicole.taylor@museum.org', hashedPassword, 'Nicole Taylor', 'staff'],
    ];
    for (const u of usersValues) {
      await client.query(
        'INSERT INTO users (email, password, name, role) VALUES ($1, $2, $3, $4)',
        u
      );
    }
    console.log('  Seeded users');

    // ── SEED COLLECTIONS ──
    const collectionsValues = [
      ['European Paintings 1400-1800', 'Masterworks of the European tradition spanning the Renaissance through Baroque periods', 'Art', '2024-01-15', 'active', 'Dr. Sarah Mitchell', 245],
      ['American Impressionism', 'Works by American artists influenced by the French Impressionist movement', 'Art', '2024-03-22', 'active', 'James Chen', 128],
      ['Ancient Egyptian Artifacts', 'Objects from tombs, temples, and daily life in ancient Egypt', 'History', '2024-02-10', 'active', 'Dr. Maria Gonzalez', 312],
      ['Natural History Specimens', 'Geological, botanical, and zoological specimens from around the world', 'Natural History', '2024-04-01', 'active', 'David Thompson', 567],
      ['Contemporary Photography', 'Photographic works from 1970 to the present day', 'Photography', '2024-05-18', 'active', 'Emily Watson', 189],
      ['Classical Sculpture', 'Greek and Roman sculptural works and casts', 'Sculpture', '2024-01-30', 'active', 'Robert Kim', 94],
      ['Asian Textiles', 'Woven, dyed, and embroidered textiles from across East and Southeast Asia', 'Textiles', '2024-06-12', 'active', 'Lisa Patel', 210],
      ['Pre-Columbian Ceramics', 'Pottery and ceramic objects from Mesoamerican and Andean cultures', 'Ceramics', '2024-07-05', 'active', 'Dr. Maria Gonzalez', 156],
      ['African Ethnographic Collection', 'Masks, figures, and ritual objects from sub-Saharan Africa', 'Ethnography', '2024-02-28', 'active', 'Michael Brown', 278],
      ['World Numismatics', 'Coins, medals, and currency from antiquity to modern times', 'Numismatics', '2024-08-14', 'active', 'Jennifer Davis', 1450],
      ['Medieval Manuscripts', 'Illuminated manuscripts and documents from the 8th to 15th centuries', 'History', '2024-03-10', 'archived', 'Dr. Sarah Mitchell', 42],
      ['Modern American Sculpture', 'Three-dimensional works by American artists from 1900 to 1970', 'Sculpture', '2024-09-01', 'active', 'Robert Kim', 87],
      ['Japanese Woodblock Prints', 'Ukiyo-e and shin-hanga prints from the Edo period through the 20th century', 'Art', '2024-04-20', 'active', 'Lisa Patel', 320],
      ['Industrial Design Archive', 'Furniture, product design, and architectural models from the 20th century', 'Art', '2024-10-15', 'pending', 'William Garcia', 165],
      ['Pacific Islands Collection', 'Navigational charts, tapa cloth, and carved objects from Oceania', 'Ethnography', '2024-11-02', 'active', 'Michael Brown', 134],
    ];
    for (const c of collectionsValues) {
      await client.query(
        'INSERT INTO collections (name, description, category, acquisition_date, status, curator, total_items) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        c
      );
    }
    console.log('  Seeded collections');

    // ── SEED GALLERIES ──
    const galleriesValues = [
      ['Grand Hall', 'Main Building, Level 1', 300, 5400, true, 'Impressionist Masters', 'active', 1, 'West'],
      ['Renaissance Gallery', 'Main Building, Level 2', 120, 3200, true, 'European Paintings 1400-1600', 'active', 2, 'West'],
      ['Modern Wing Gallery A', 'Modern Wing, Level 1', 200, 4100, true, 'Contemporary Visions', 'active', 1, 'East'],
      ['Sculpture Court', 'Main Building, Level 1', 150, 6000, false, 'Classical Forms', 'active', 1, 'Central'],
      ['Photography Gallery', 'Modern Wing, Level 2', 80, 1800, true, 'Lens and Light', 'active', 2, 'East'],
      ['Egyptian Hall', 'Main Building, Level 1', 180, 4500, true, 'Treasures of the Nile', 'active', 1, 'South'],
      ['Asian Art Gallery', 'Main Building, Level 3', 100, 2600, true, 'Silk Road Connections', 'active', 3, 'West'],
      ['Temporary Exhibition Hall', 'Main Building, Level 1', 250, 5200, true, null, 'active', 1, 'North'],
      ['Print Study Room', 'Research Wing, Level 2', 40, 900, true, null, 'active', 2, 'North'],
      ["Children's Gallery", 'Education Wing, Level 1', 100, 2000, false, 'Art Adventures', 'active', 1, 'East'],
      ['Numismatics Cabinet', 'Main Building, Level 3', 30, 600, true, 'World Currencies', 'active', 3, 'South'],
      ['Textile Conservation Gallery', 'Main Building, Level 2', 60, 1500, true, null, 'renovation', 2, 'South'],
      ['Outdoor Sculpture Garden', 'Exterior Grounds', 500, 12000, false, 'Monumental Works', 'active', 0, 'Central'],
      ['Media Arts Lab', 'Modern Wing, Level 3', 75, 1600, true, 'Digital Frontiers', 'active', 3, 'East'],
      ['Founders Gallery', 'Main Building, Level 1', 90, 2200, true, 'Museum History', 'closed', 1, 'Central'],
    ];
    for (const g of galleriesValues) {
      await client.query(
        'INSERT INTO galleries (name, location, capacity, square_footage, climate_controlled, current_exhibition, status, floor, wing) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
        g
      );
    }
    console.log('  Seeded galleries');

    // ── SEED OBJECTS ──
    const objectsValues = [
      ['Water Lilies at Twilight', 'Claude Monet', '1906', 'Oil on canvas', '200 x 150 cm', 'ACC-2024-001', 'Acquired from private collection, Paris, 2024. Previously in the Durand-Ruel Gallery.', 'Excellent', 'Grand Hall', 1, null, 12500000, 'A luminous depiction of Monet\'s garden at Giverny in the fading light of evening.'],
      ['Portrait of a Venetian Nobleman', 'Titian (Tiziano Vecellio)', 'c. 1540', 'Oil on panel', '112 x 86 cm', 'ACC-2024-002', 'Provenance traced to the Contarini family, Venice. Acquired at Christie\'s, London, 2024.', 'Good', 'Renaissance Gallery', 1, null, 8750000, 'A commanding half-length portrait exemplifying Titian\'s mastery of color and psychological insight.'],
      ['Canopic Jar of Imsety', 'Unknown Egyptian Craftsman', 'c. 1250 BCE', 'Painted limestone', '38 x 18 x 18 cm', 'ACC-2024-003', 'Excavated at Deir el-Medina, 1922. Acquired from the British Museum deaccession, 2024.', 'Good', 'Egyptian Hall', 3, null, 450000, 'A funerary jar with a human-headed lid, used to store the liver of the deceased.'],
      ['Autumn in Central Park', 'Childe Hassam', '1892', 'Oil on canvas', '91 x 73 cm', 'ACC-2024-004', 'Private collection, New York. Gift of the Worthington Family Trust, 2024.', 'Excellent', 'Grand Hall', 2, null, 3200000, 'A vibrant plein-air study of Central Park during peak fall foliage.'],
      ['Standing Figure (Ancestor)', 'Unknown Baule Artist', 'Early 20th century', 'Carved wood, pigment', '56 x 14 x 12 cm', 'ACC-2024-005', 'Collected by Marcel Griaule expedition, 1935. Acquired from Galerie Descours, 2024.', 'Fair', 'Storage B-12', 9, null, 85000, 'A refined standing figure with characteristic Baule scarification patterns and serene expression.'],
      ['The Great Wave Study', 'Katsushika Hokusai', 'c. 1831', 'Woodblock print, ink on paper', '25 x 37 cm', 'ACC-2024-006', 'From the Pulverer Collection, Cologne. Acquired 2024.', 'Good', 'Asian Art Gallery', 13, null, 1800000, 'An early impression of the iconic wave from the Thirty-six Views of Mount Fuji series.'],
      ['Discobolus (Cast)', 'After Myron', 'Roman copy, c. 2nd century CE', 'Marble', '155 x 60 x 80 cm', 'ACC-2024-007', 'Excavated near Tivoli, 1791. Purchased from Villa Albani collection, 2024.', 'Fair', 'Sculpture Court', 6, null, 2100000, 'A Roman marble copy of the famous Greek bronze of a discus thrower.'],
      ['Silver Tetradrachm of Athens', 'Unknown Athenian Mint', 'c. 449 BCE', 'Silver', '2.4 cm diameter', 'ACC-2024-008', 'Ex. Hunt Collection. Acquired at Heritage Auctions, 2024.', 'Excellent', 'Numismatics Cabinet', 10, null, 95000, 'An Athenian owl tetradrachm, the most widely recognized coin of the ancient world.'],
      ['Dusk Over the Hudson', 'Georgia O\'Keeffe', '1928', 'Oil on canvas', '76 x 102 cm', 'ACC-2024-009', 'From the estate of Anita Pollitzer. Acquired at Sotheby\'s, 2024.', 'Excellent', 'Modern Wing Gallery A', 1, null, 9400000, 'A sweeping abstract landscape capturing the atmospheric qualities of the Hudson River Valley.'],
      ['Moche Portrait Vessel', 'Unknown Moche Artist', 'c. 400 CE', 'Painted ceramic', '28 x 18 x 20 cm', 'ACC-2024-010', 'From the Larco Herrera Museum deaccession, Lima. Acquired 2024.', 'Good', 'Storage C-04', 8, null, 320000, 'A stirrup-spout vessel depicting an elite individual with distinctive facial features.'],
      ['Illuminated Book of Hours', 'Workshop of Jean Fouquet', 'c. 1460', 'Tempera and gold on vellum', '20 x 14 cm (closed)', 'ACC-2024-011', 'Formerly in the Rothschild Collection. Acquired at Drouot, Paris, 2024.', 'Good', 'Print Study Room', 11, null, 4200000, 'A lavishly decorated prayer book with twelve full-page calendar miniatures.'],
      ['Navajo Chief\'s Blanket, Third Phase', 'Unknown Navajo Weaver', 'c. 1870', 'Hand-spun wool, natural dyes', '152 x 132 cm', 'ACC-2024-012', 'Ex. William Randolph Hearst Collection. Acquired from Morning Star Gallery, 2024.', 'Fair', 'Textile Conservation Gallery', 7, null, 750000, 'A rare Third Phase chief\'s blanket with bold diamond and stripe pattern.'],
      ['Untitled #96', 'Cindy Sherman', '1981', 'Chromogenic color print', '61 x 122 cm', 'ACC-2024-013', 'Acquired directly from Metro Pictures gallery, New York, 2024.', 'Excellent', 'Photography Gallery', 5, null, 3890000, 'One of Sherman\'s iconic Centerfolds series exploring constructed femininity.'],
      ['Eames Lounge Chair (670)', 'Charles and Ray Eames', '1956', 'Molded plywood, leather, aluminum', '84 x 83 x 83 cm', 'ACC-2024-014', 'First production run, Herman Miller. Gift of the Eames Foundation, 2024.', 'Good', 'Storage D-01', 14, null, 125000, 'An early example of the iconic lounge chair from the first production year.'],
      ['Tapa Cloth (Ngatu)', 'Unknown Tongan Artist', 'c. 1920', 'Beaten bark cloth, natural pigments', '300 x 180 cm', 'ACC-2024-015', 'Collected by A.C. Haddon. Transferred from Cambridge MAA, 2024.', 'Fair', 'Storage B-08', 15, null, 45000, 'A large ceremonial bark cloth with geometric patterns used in royal occasions.'],
    ];
    for (const o of objectsValues) {
      await client.query(
        'INSERT INTO objects (title, artist_creator, date_created, medium, dimensions, accession_number, provenance, condition, location, collection_id, photo_url, insurance_value, description) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)',
        o
      );
    }
    console.log('  Seeded objects');

    // ── SEED EXHIBITIONS ──
    const exhibitionsValues = [
      ['Impressionist Masters: Light and Color', 'A comprehensive survey of Impressionist painting featuring works from major European and American collections', '2025-01-15', '2025-06-30', 1, 'Dr. Sarah Mitchell', 'current', 450000, 'Impressionism'],
      ['Treasures of the Nile', 'Ancient Egyptian artifacts spanning three thousand years of pharaonic civilization', '2024-09-01', '2025-03-31', 6, 'Dr. Maria Gonzalez', 'current', 380000, 'Ancient Civilizations'],
      ['Contemporary Visions: Art After 2000', 'Emerging voices in contemporary art across painting, sculpture, and new media', '2025-03-01', '2025-09-15', 3, 'Emily Watson', 'current', 275000, 'Contemporary Art'],
      ['Lens and Light: 50 Years of Photography', 'A retrospective exploring the evolution of photographic practice since 1970', '2025-02-01', '2025-07-31', 5, 'Emily Watson', 'current', 195000, 'Photography'],
      ['Classical Forms: Greek and Roman Sculpture', 'Marble and bronze works from the ancient Mediterranean world', '2024-06-01', '2025-05-31', 4, 'Robert Kim', 'current', 320000, 'Classical Antiquity'],
      ['Silk Road Connections', 'Art and artifacts tracing cultural exchange across the ancient trade routes', '2025-04-15', '2025-10-15', 7, 'Lisa Patel', 'upcoming', 410000, 'Global Exchange'],
      ['Art Adventures: Museum Explorers', 'Interactive exhibition designed for families and young visitors', '2025-01-01', '2025-12-31', 10, 'Jennifer Davis', 'current', 120000, 'Education'],
      ['Digital Frontiers: Art and Technology', 'Immersive installations exploring the intersection of art and emerging technology', '2025-06-01', '2025-11-30', 14, 'William Garcia', 'upcoming', 350000, 'Digital Art'],
      ['The American Landscape Tradition', 'From the Hudson River School to contemporary environmental art', '2025-09-01', '2026-02-28', 1, 'James Chen', 'planning', 290000, 'American Art'],
      ['World Currencies Through the Ages', 'The history of money from ancient electrum coins to digital currency', '2024-11-01', '2025-04-30', 11, 'Jennifer Davis', 'current', 85000, 'Numismatics'],
      ['Monumental Works: Outdoor Sculpture', 'Large-scale sculptures in the museum\'s garden and grounds', '2024-04-01', '2025-10-31', 13, 'Robert Kim', 'current', 180000, 'Sculpture'],
      ['Weaving Worlds: Textiles of Asia', 'Hand-woven and embroidered textiles from Japan, China, India, and Southeast Asia', '2025-07-15', '2026-01-15', 12, 'Lisa Patel', 'planning', 225000, 'Textiles'],
      ['Faces of Power: Portraiture Across Cultures', 'How different civilizations represented authority through portraiture', '2025-10-01', '2026-04-30', 8, 'Dr. Sarah Mitchell', 'planning', 520000, 'Cross-Cultural'],
      ['Hidden Treasures: Works from Storage', 'Rarely seen objects brought out from the museum\'s vast reserves', '2024-12-01', '2025-05-31', 8, 'Michael Brown', 'current', 95000, 'General'],
      ['Museum History: A Century of Collecting', 'Celebrating 100 years of the museum through key acquisitions and milestones', '2024-10-01', '2025-01-31', 15, 'Daniel Martinez', 'past', 60000, 'Institutional History'],
    ];
    for (const e of exhibitionsValues) {
      await client.query(
        'INSERT INTO exhibitions (title, description, start_date, end_date, gallery_id, curator, status, budget, theme) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
        e
      );
    }
    console.log('  Seeded exhibitions');

    // ── SEED LOANS ──
    const loansValues = [
      [1, 'outgoing', 'Metropolitan Museum of Art', 'Dr. Helen Bridges', 'h.bridges@metmuseum.org', '2025-06-01', '2025-12-31', 'approved', 12500000, 'Special exhibition loan. Courier required.'],
      [2, 'outgoing', 'National Gallery, London', 'James Harlow', 'j.harlow@nationalgallery.org.uk', '2025-09-15', '2026-03-15', 'pending', 8750000, 'Titian retrospective. Climate-controlled crate required.'],
      [4, 'outgoing', 'Museum of Fine Arts, Boston', 'Anne Sullivan', 'a.sullivan@mfa.org', '2025-04-01', '2025-08-31', 'active', 3200000, 'American Impressionism touring exhibition.'],
      [6, 'incoming', 'Tokyo National Museum', 'Kenji Yamamoto', 'k.yamamoto@tnm.jp', '2025-05-01', '2025-11-30', 'active', 1800000, 'Hokusai traveling exhibition loan.'],
      [9, 'outgoing', 'Whitney Museum of American Art', 'Rachel Greene', 'r.greene@whitney.org', '2025-07-01', '2026-01-31', 'approved', 9400000, 'O\'Keeffe centennial celebration.'],
      [13, 'outgoing', 'Museum of Modern Art', 'David Platt', 'd.platt@moma.org', '2025-08-15', '2026-02-15', 'pending', 3890000, 'Cindy Sherman survey exhibition.'],
      [7, 'incoming', 'Musee du Louvre', 'Sophie Leclerc', 's.leclerc@louvre.fr', '2025-03-01', '2025-09-30', 'active', 2100000, 'Classical sculpture exchange program.'],
      [3, 'outgoing', 'British Museum', 'Thomas Clarke', 't.clarke@britishmuseum.org', '2025-10-01', '2026-04-30', 'pending', 450000, 'Egyptian funerary arts exhibition.'],
      [11, 'outgoing', 'Getty Museum', 'Laura Chen', 'l.chen@getty.edu', '2025-05-15', '2025-11-15', 'active', 4200000, 'Medieval illuminated manuscripts show.'],
      [5, 'incoming', 'Musee du Quai Branly', 'Pierre Duval', 'p.duval@quaibranly.fr', '2025-04-15', '2025-10-15', 'active', 150000, 'African art exchange. Three additional objects included.'],
      [10, 'outgoing', 'Smithsonian National Museum', 'Karen Wells', 'k.wells@si.edu', '2025-11-01', '2026-05-31', 'pending', 320000, 'Pre-Columbian ceramics traveling show.'],
      [8, 'outgoing', 'American Numismatic Society', 'Paul Rynearson', 'p.rynearson@numismatics.org', '2025-02-01', '2025-06-30', 'active', 95000, 'Ancient coinage exhibition loan.'],
      [12, 'incoming', 'Peabody Museum, Harvard', 'Diana Morgan', 'd.morgan@harvard.edu', '2025-06-15', '2025-12-15', 'approved', 500000, 'Native American textile exchange.'],
      [14, 'incoming', 'Vitra Design Museum', 'Stefan Mueller', 's.mueller@design-museum.de', '2025-08-01', '2026-02-28', 'pending', 200000, 'Mid-century design retrospective loan.'],
      [15, 'outgoing', 'Bishop Museum, Honolulu', 'Lani Akana', 'l.akana@bishopmuseum.org', '2025-09-01', '2026-03-31', 'approved', 45000, 'Pacific Islands cultural heritage touring exhibition.'],
    ];
    for (const l of loansValues) {
      await client.query(
        'INSERT INTO loans (object_id, type, institution, contact_person, contact_email, start_date, end_date, status, insurance_value, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
        l
      );
    }
    console.log('  Seeded loans');

    // ── SEED CONSERVATION ──
    const conservationValues = [
      [5, '2025-01-10', 'Dr. Elena Rossi', 'Fair', 'Good', 'Surface cleaning, consolidation of paint layer, and minor infill of losses on base', 'Paraloid B-72, Japanese tissue, pigmented wax fill', 24.5, 3200, '2026-01-10', 'medium', 'completed'],
      [7, '2025-02-15', 'Marcus Webb', 'Fair', 'Fair', 'Structural assessment and stabilization of marble fracture on right arm', 'Epoxy resin, stainless steel pins, marble dust fill', 40.0, 5800, '2025-08-15', 'high', 'completed'],
      [10, '2025-03-01', 'Dr. Elena Rossi', 'Good', 'Good', 'Preventive conservation: custom mount fabrication and environmental monitoring setup', 'Ethafoam, Tyvek, silica gel', 8.0, 1200, '2026-03-01', 'low', 'completed'],
      [12, '2025-01-20', 'Akiko Tanaka', 'Fair', 'Fair', 'Fiber analysis, surface vacuuming, and humidification treatment for creases', 'Deionized water, blotting paper, Mylar', 32.0, 4500, '2025-07-20', 'high', 'completed'],
      [15, '2025-02-28', 'Akiko Tanaka', 'Fair', null, 'Tapa cloth stabilization: tear repair and backing support application', 'Japanese tissue, wheat starch paste, Reemay', 28.0, 3800, '2025-08-28', 'high', 'in-progress'],
      [1, '2025-04-05', 'Dr. Elena Rossi', 'Excellent', 'Excellent', 'Routine examination and varnish assessment. No treatment required.', 'None', 3.0, 400, '2026-04-05', 'low', 'completed'],
      [3, '2025-03-15', 'Marcus Webb', 'Good', 'Good', 'Limestone consolidation and surface cleaning of painted decoration', 'Cyclododecylamine, soft brushes, scalpel', 16.0, 2800, '2025-09-15', 'medium', 'completed'],
      [6, '2025-05-10', 'Akiko Tanaka', 'Good', null, 'Print flattening, foxing reduction, and hinge repair for mounting', 'Deionized water, ethanol, Japanese tissue, wheat starch paste', 12.0, 1800, '2025-11-10', 'medium', 'in-progress'],
      [11, '2025-04-20', 'Dr. Elena Rossi', 'Good', 'Good', 'Vellum stabilization, gold leaf consolidation on three miniatures', 'Isinglass, gold leaf, parchment size', 45.0, 8500, '2025-10-20', 'high', 'completed'],
      [2, '2025-06-01', 'Marcus Webb', 'Good', null, 'Panel examination using X-ray and infrared reflectography. Cradle assessment.', 'None (diagnostic phase)', 6.0, 2200, '2025-12-01', 'medium', 'pending'],
      [4, '2025-05-20', 'Dr. Elena Rossi', 'Excellent', 'Excellent', 'Routine condition check for loan preparation. Minor frame touch-up.', 'Pigmented wax, synthetic varnish', 4.0, 600, '2026-05-20', 'low', 'completed'],
      [9, '2025-06-15', 'Marcus Webb', 'Excellent', null, 'Condition assessment for outgoing loan to Whitney Museum', 'None (assessment only)', 3.5, 500, '2026-06-15', 'low', 'pending'],
      [8, '2025-07-01', 'Dr. Elena Rossi', 'Excellent', 'Excellent', 'Silver stabilization treatment and protective coating application', 'Silver polish, microcrystalline wax, Paraloid B-48N', 5.0, 900, '2026-07-01', 'low', 'completed'],
      [13, '2025-04-10', 'Akiko Tanaka', 'Excellent', 'Excellent', 'Photographic print surface cleaning and archival rehousing', 'PEC-12, archival mat board, Mylar sleeve', 6.0, 1100, '2026-04-10', 'low', 'completed'],
      [14, '2025-07-15', 'Marcus Webb', 'Good', null, 'Leather assessment and plywood veneer inspection. Minor leather conditioning.', 'Renaissance leather conditioner, microfiber cloth', 8.0, 1400, '2026-01-15', 'medium', 'in-progress'],
    ];
    for (const c of conservationValues) {
      await client.query(
        'INSERT INTO conservation (object_id, report_date, conservator, condition_before, condition_after, treatment, materials_used, hours_spent, cost, next_review, priority, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)',
        c
      );
    }
    console.log('  Seeded conservation');

    // ── SEED ENVIRONMENT_LOGS ──
    const envLogsValues = [
      [1, '2025-03-20 09:00:00', 21.2, 48.5, 150, 420, 'normal', null],
      [1, '2025-03-20 13:00:00', 21.8, 49.1, 165, 435, 'normal', null],
      [2, '2025-03-20 09:00:00', 20.8, 47.2, 120, 410, 'normal', null],
      [3, '2025-03-20 09:00:00', 22.1, 50.3, 180, 445, 'normal', null],
      [4, '2025-03-20 09:00:00', 19.5, 52.8, 200, 460, 'warning', 'Humidity slightly above target range for marble sculpture.'],
      [5, '2025-03-20 09:00:00', 20.5, 45.0, 50, 415, 'normal', 'Light levels kept low for photographic works.'],
      [6, '2025-03-20 09:00:00', 21.0, 46.5, 130, 425, 'normal', null],
      [7, '2025-03-20 09:00:00', 20.2, 50.1, 110, 418, 'normal', null],
      [8, '2025-03-20 09:00:00', 21.5, 48.8, 170, 430, 'normal', null],
      [10, '2025-03-20 09:00:00', 22.5, 55.2, 190, 470, 'warning', 'Humidity elevated due to high visitor traffic.'],
      [11, '2025-03-20 09:00:00', 20.0, 44.5, 80, 405, 'normal', 'Vault-level controlled environment.'],
      [13, '2025-03-20 09:00:00', 15.8, 60.1, 800, 380, 'normal', 'Outdoor readings, ambient conditions.'],
      [14, '2025-03-20 09:00:00', 21.3, 47.9, 95, 422, 'normal', null],
      [6, '2025-03-20 17:00:00', 21.8, 47.0, 125, 440, 'normal', 'Evening reading after gallery close.'],
      [3, '2025-03-20 17:00:00', 23.2, 53.5, 160, 480, 'warning', 'Temperature rose during afternoon. HVAC adjustment scheduled.'],
    ];
    for (const e of envLogsValues) {
      await client.query(
        'INSERT INTO environment_logs (gallery_id, timestamp, temperature, humidity, light_level, co2_level, status, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        e
      );
    }
    console.log('  Seeded environment_logs');

    // ── SEED STORAGE_LOCATIONS ──
    const storageValues = [
      ['Vault A-01', 'Main Building', 'Basement Level 1', 'Cabinet A', 'Shelf 1-4', 50, 42, 'vault', 'available', 'High-security vault for precious metals and gemstones'],
      ['Storage B-12', 'Main Building', 'Basement Level 2', 'Rack B', 'Shelf 12', 30, 28, 'controlled', 'available', 'Climate-controlled for wooden and organic artifacts'],
      ['Storage C-04', 'Main Building', 'Basement Level 2', 'Rack C', 'Shelf 4', 40, 35, 'controlled', 'available', 'Ceramics and pottery storage'],
      ['Storage D-01', 'Annex Building', 'Ground Floor', 'Unit D', 'Bay 1', 20, 18, 'ambient', 'available', 'Large-format furniture and design objects'],
      ['Cold Storage E-01', 'Annex Building', 'Basement', 'Freezer Unit E', null, 100, 67, 'cold', 'available', 'Film, photographic negatives, and cellulose-based media'],
      ['Textile Flat Storage F-01', 'Main Building', 'Basement Level 1', 'Drawer Unit F', 'Drawers 1-20', 60, 52, 'controlled', 'available', 'Acid-free flat storage for textiles and works on paper'],
      ['Painting Rack G-01', 'Main Building', 'Basement Level 1', 'Sliding Rack G', null, 80, 71, 'controlled', 'available', 'Vertical sliding racks for framed paintings'],
      ['Storage B-08', 'Main Building', 'Basement Level 2', 'Rack B', 'Shelf 8', 25, 22, 'controlled', 'available', 'Ethnographic textiles and bark cloth'],
      ['Sculpture Storage H-01', 'Annex Building', 'Ground Floor', 'Bay H', null, 15, 14, 'ambient', 'available', 'Heavy objects, plinths, and large-scale sculpture'],
      ['Archive Room J-01', 'Research Wing', 'Level 1', 'Filing Unit J', 'Drawers 1-50', 200, 185, 'controlled', 'available', 'Institutional archives, correspondence, and documents'],
      ['Map Cabinet K-01', 'Research Wing', 'Level 1', 'Cabinet K', 'Drawers 1-10', 150, 130, 'controlled', 'available', 'Oversized flat works: maps, architectural drawings, posters'],
      ['Crate Storage L-01', 'Annex Building', 'Loading Dock', 'Bay L', null, 30, 12, 'ambient', 'available', 'Shipping crates for incoming and outgoing loans'],
      ['Numismatics Cabinet M-01', 'Main Building', 'Basement Level 1', 'Cabinet M', 'Trays 1-100', 500, 480, 'vault', 'available', 'Individual coin trays in climate-controlled vault'],
      ['Quarantine Storage N-01', 'Annex Building', 'Basement', 'Isolation Unit N', null, 20, 3, 'controlled', 'available', 'Isolation area for newly acquired objects pending pest inspection'],
      ['Off-site Facility P-01', 'Off-site Warehouse', 'Building P', 'Section 1', 'Rows 1-10', 300, 245, 'ambient', 'available', 'Long-term storage for low-priority collections and duplicates'],
    ];
    for (const s of storageValues) {
      await client.query(
        'INSERT INTO storage_locations (name, building, room, unit, shelf, capacity, current_count, climate_type, status, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
        s
      );
    }
    console.log('  Seeded storage_locations');

    // ── SEED INSURANCE_RECORDS ──
    const insuranceValues = [
      [1, 'MUS-POL-2025-001', 'AXA Art Insurance', 15000000, 18500, '2025-01-01', '2025-12-31', 'permanent', 'active', 12500000, '2024-11-15'],
      [2, 'MUS-POL-2025-002', 'AXA Art Insurance', 10000000, 12800, '2025-01-01', '2025-12-31', 'permanent', 'active', 8750000, '2024-11-15'],
      [3, 'MUS-POL-2025-003', 'Hiscox Fine Art', 600000, 1200, '2025-01-01', '2025-12-31', 'permanent', 'active', 450000, '2024-10-20'],
      [4, 'MUS-TRN-2025-001', 'Huntington T. Block', 4000000, 8500, '2025-04-01', '2025-08-31', 'transit', 'active', 3200000, '2025-02-28'],
      [5, 'MUS-POL-2025-005', 'Hiscox Fine Art', 120000, 480, '2025-01-01', '2025-12-31', 'permanent', 'active', 85000, '2024-10-20'],
      [6, 'MUS-POL-2025-006', 'AXA Art Insurance', 2200000, 4800, '2025-01-01', '2025-12-31', 'permanent', 'active', 1800000, '2024-11-15'],
      [7, 'MUS-LON-2025-001', 'Lloyd\'s of London', 2500000, 6200, '2025-03-01', '2025-09-30', 'loan', 'active', 2100000, '2025-01-15'],
      [8, 'MUS-POL-2025-008', 'Hiscox Fine Art', 130000, 350, '2025-01-01', '2025-12-31', 'permanent', 'active', 95000, '2024-10-20'],
      [9, 'MUS-EXH-2025-001', 'Huntington T. Block', 11000000, 15200, '2025-07-01', '2026-01-31', 'exhibition', 'active', 9400000, '2025-05-10'],
      [10, 'MUS-POL-2025-010', 'Hiscox Fine Art', 400000, 920, '2025-01-01', '2025-12-31', 'permanent', 'active', 320000, '2024-10-20'],
      [11, 'MUS-POL-2025-011', 'AXA Art Insurance', 5000000, 9800, '2025-01-01', '2025-12-31', 'permanent', 'active', 4200000, '2024-11-15'],
      [12, 'MUS-POL-2025-012', 'Hiscox Fine Art', 900000, 1800, '2025-01-01', '2025-12-31', 'permanent', 'active', 750000, '2024-10-20'],
      [13, 'MUS-TRN-2025-002', 'Lloyd\'s of London', 4500000, 9200, '2025-08-15', '2026-02-15', 'transit', 'pending', 3890000, '2025-06-20'],
      [14, 'MUS-LON-2025-002', 'Huntington T. Block', 250000, 680, '2025-08-01', '2026-02-28', 'loan', 'pending', 125000, '2025-05-30'],
      [15, 'MUS-POL-2025-015', 'Hiscox Fine Art', 60000, 240, '2025-01-01', '2025-12-31', 'permanent', 'active', 45000, '2024-10-20'],
    ];
    for (const i of insuranceValues) {
      await client.query(
        'INSERT INTO insurance_records (object_id, policy_number, provider, coverage_amount, premium, start_date, end_date, type, status, appraised_value, appraisal_date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
        i
      );
    }
    console.log('  Seeded insurance_records');

    // ── SEED TICKETS ──
    const ticketsValues = [
      ['Margaret Thompson', 'm.thompson@email.com', '2025-03-20', 'adult', 2, 50.00, 'credit_card', 'confirmed', 1],
      ['Robert Chen', 'r.chen@email.com', '2025-03-20', 'adult', 1, 25.00, 'credit_card', 'used', 2],
      ['Lakewood Elementary School', 'office@lakewood.edu', '2025-03-21', 'group', 30, 300.00, 'invoice', 'confirmed', 7],
      ['Diana Kowalski', 'd.kowalski@email.com', '2025-03-20', 'senior', 2, 36.00, 'debit_card', 'used', 1],
      ['James Nguyen', 'j.nguyen@email.com', '2025-03-22', 'student', 1, 15.00, 'credit_card', 'confirmed', 3],
      ['Sarah O\'Brien', 's.obrien@email.com', '2025-03-19', 'adult', 4, 100.00, 'credit_card', 'used', 4],
      ['Michael Patel', 'm.patel@email.com', '2025-03-23', 'member', 2, 0.00, 'membership', 'confirmed', 1],
      ['The Garcia Family', 'garcia.family@email.com', '2025-03-20', 'child', 3, 30.00, 'cash', 'used', 7],
      ['Elizabeth Warren', 'e.warren@email.com', '2025-03-24', 'adult', 1, 25.00, 'credit_card', 'confirmed', 3],
      ['Thomas Andersson', 't.andersson@email.com', '2025-03-18', 'adult', 2, 50.00, 'credit_card', 'used', 2],
      ['Riverside High School', 'trips@riverside.edu', '2025-03-25', 'group', 25, 250.00, 'invoice', 'confirmed', 5],
      ['Catherine Liu', 'c.liu@email.com', '2025-03-20', 'student', 2, 30.00, 'debit_card', 'used', 14],
      ['Ahmed Hassan', 'a.hassan@email.com', '2025-03-19', 'adult', 1, 25.00, 'credit_card', 'cancelled', 1],
      ['Patricia Moore', 'p.moore@email.com', '2025-03-26', 'senior', 1, 18.00, 'credit_card', 'confirmed', 10],
      ['David Kim', 'd.kim@email.com', '2025-03-17', 'adult', 3, 75.00, 'credit_card', 'refunded', 3],
    ];
    for (const t of ticketsValues) {
      await client.query(
        'INSERT INTO tickets (visitor_name, email, visit_date, ticket_type, quantity, amount, payment_method, status, exhibition_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
        t
      );
    }
    console.log('  Seeded tickets');

    // ── SEED MEMBERSHIPS ──
    const membershipsValues = [
      ['Victoria Harrington', 'v.harrington@email.com', '555-0101', 'Director\'s Circle', '2024-07-01', '2025-06-30', 'active', 'Unlimited free admission, private viewings, annual gala invitation, curator dinners, naming recognition', 10000.00, true],
      ['Charles and Eleanor Whitfield', 'c.whitfield@email.com', '555-0102', 'Benefactor', '2024-09-15', '2025-09-14', 'active', 'Unlimited free admission, private viewings, annual gala invitation, exhibition catalogs', 5000.00, true],
      ['The Morrison Family', 'morrison.fam@email.com', '555-0103', 'Patron', '2024-11-01', '2025-10-31', 'active', 'Unlimited free admission, guest passes, member events, gift shop discount', 2500.00, true],
      ['Rachel Goldstein', 'r.goldstein@email.com', '555-0104', 'Family', '2025-01-15', '2026-01-14', 'active', 'Free admission for two adults and children, member events, 10% shop discount', 250.00, true],
      ['Nathan Brooks', 'n.brooks@email.com', '555-0105', 'Individual', '2025-02-01', '2026-01-31', 'active', 'Free admission, member newsletter, 10% shop discount', 100.00, true],
      ['Sophia and Marcus Lee', 's.lee@email.com', '555-0106', 'Dual', '2025-01-01', '2025-12-31', 'active', 'Free admission for two, member events, 10% shop discount', 150.00, true],
      ['Margaret Dupont', 'm.dupont@email.com', '555-0107', 'Patron', '2024-06-01', '2025-05-31', 'active', 'Unlimited free admission, guest passes, member events, gift shop discount', 2500.00, false],
      ['William Tanaka', 'w.tanaka@email.com', '555-0108', 'Individual', '2024-03-15', '2025-03-14', 'expired', 'Free admission, member newsletter, 10% shop discount', 100.00, false],
      ['Helen and George Papadopoulos', 'h.papa@email.com', '555-0109', 'Benefactor', '2025-02-15', '2026-02-14', 'active', 'Unlimited free admission, private viewings, annual gala invitation, exhibition catalogs', 5000.00, true],
      ['Jennifer Castro', 'j.castro@email.com', '555-0110', 'Family', '2024-08-01', '2025-07-31', 'active', 'Free admission for two adults and children, member events, 10% shop discount', 250.00, true],
      ['Robert Lindqvist', 'r.lindqvist@email.com', '555-0111', 'Individual', '2025-03-01', '2026-02-28', 'active', 'Free admission, member newsletter, 10% shop discount', 100.00, true],
      ['Amanda Sterling', 'a.sterling@email.com', '555-0112', 'Director\'s Circle', '2024-10-01', '2025-09-30', 'active', 'Unlimited free admission, private viewings, annual gala invitation, curator dinners, naming recognition', 10000.00, true],
      ['Daniel and Maria Santos', 'd.santos@email.com', '555-0113', 'Dual', '2024-12-01', '2025-11-30', 'active', 'Free admission for two, member events, 10% shop discount', 150.00, false],
      ['Priya Sharma', 'p.sharma@email.com', '555-0114', 'Individual', '2025-03-10', '2026-03-09', 'pending', 'Free admission, member newsletter, 10% shop discount', 100.00, true],
      ['Edward FitzGerald', 'e.fitzgerald@email.com', '555-0115', 'Patron', '2024-05-01', '2025-04-30', 'active', 'Unlimited free admission, guest passes, member events, gift shop discount', 2500.00, true],
    ];
    for (const m of membershipsValues) {
      await client.query(
        'INSERT INTO memberships (member_name, email, phone, tier, start_date, end_date, status, benefits, annual_fee, auto_renew) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
        m
      );
    }
    console.log('  Seeded memberships');

    // ── SEED DONORS ──
    const donorsValues = [
      ['The Harrington Foundation', 'grants@harringtonfdn.org', '555-0201', 'foundation', 2500000, '2025-01-15', 'major', 'Victoria Harrington', 'Founding benefactor. Named gallery: Harrington Wing.', 'Platinum'],
      ['Whitfield Family Trust', 'trust@whitfieldlaw.com', '555-0202', 'estate', 1200000, '2024-12-01', 'major', 'Charles Whitfield', 'Multi-generational supporters. Annual gala sponsors.', 'Platinum'],
      ['Meridian Corporation', 'csr@meridiancorp.com', '555-0203', 'corporate', 750000, '2025-02-28', 'active', 'James Chen', 'Corporate partner since 2020. Sponsors education programs.', 'Gold'],
      ['Dr. Eleanor Voss', 'e.voss@university.edu', '555-0204', 'individual', 450000, '2025-03-10', 'active', 'Dr. Sarah Mitchell', 'Art historian. Donates works from personal collection.', 'Gold'],
      ['National Endowment for the Arts', 'grants@arts.gov', '555-0205', 'government', 350000, '2024-10-01', 'active', 'Daniel Martinez', 'Federal grant for conservation program. Annual renewal.', 'Silver'],
      ['Sterling Industries', 'philanthropy@sterlinginc.com', '555-0206', 'corporate', 500000, '2025-01-30', 'active', 'Amanda Sterling', 'Technology sponsor. Funds digital gallery initiative.', 'Gold'],
      ['Margaret Chen', 'm.chen@email.com', '555-0207', 'individual', 180000, '2025-02-14', 'active', 'Lisa Patel', 'Passionate about Asian art. Funds acquisition fund.', 'Silver'],
      ['The Beaumont Estate', 'executor@beaumontestate.com', '555-0208', 'estate', 3200000, '2024-08-15', 'major', 'Dr. Sarah Mitchell', 'Bequest of 45 paintings and endowment fund.', 'Platinum'],
      ['Pacific Cultural Foundation', 'director@pacificcultural.org', '555-0209', 'foundation', 280000, '2025-03-01', 'active', 'Michael Brown', 'Supports Pacific Islands collection care and exhibition.', 'Silver'],
      ['Jonathan and Alicia Park', 'j.park@email.com', '555-0210', 'individual', 95000, '2024-11-20', 'active', 'Jennifer Davis', 'Young collectors. Interested in contemporary photography.', 'Bronze'],
      ['State Arts Council', 'grants@stateartscouncil.gov', '555-0211', 'government', 200000, '2025-01-01', 'active', 'Daniel Martinez', 'Annual operating support grant.', 'Silver'],
      ['Heritage Bank', 'community@heritagebank.com', '555-0212', 'corporate', 125000, '2024-09-15', 'active', 'William Garcia', 'Sponsors free admission Saturdays and school programs.', 'Silver'],
      ['Dr. Ahmad Rashid', 'a.rashid@email.com', '555-0213', 'individual', 65000, '2025-02-01', 'active', 'Dr. Maria Gonzalez', 'Numismatics enthusiast. Donated Islamic coin collection.', 'Bronze'],
      ['Catherine Lombardi', 'c.lombardi@email.com', '555-0214', 'individual', 35000, '2024-12-20', 'prospect', 'Emily Watson', 'Attended three cultivation events. Strong prospect for major gift.', 'Bronze'],
      ['Greenfield Community Foundation', 'grants@greenfieldcf.org', '555-0215', 'foundation', 150000, '2025-03-15', 'active', 'Jennifer Davis', 'Supports community engagement and accessibility programs.', 'Silver'],
    ];
    for (const d of donorsValues) {
      await client.query(
        'INSERT INTO donors (name, email, phone, type, total_given, last_gift_date, status, steward, notes, recognition_level) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
        d
      );
    }
    console.log('  Seeded donors');

    // ── SEED GIFT_SHOP_ITEMS ──
    const giftShopValues = [
      ['Monet Water Lilies Print (24x36)', 'Prints', 45.00, 12.50, 120, 'PRT-MON-001', 'Museum Art Prints Co.', 20, 'in-stock', 'High-quality giclée reproduction on archival paper'],
      ['Museum Logo Tote Bag', 'Accessories', 22.00, 6.00, 200, 'ACC-TOT-001', 'EcoBag Wholesale', 30, 'in-stock', 'Organic cotton tote with embroidered museum logo'],
      ['Egyptian Scarab Pendant (Gold-plated)', 'Jewelry', 65.00, 18.00, 45, 'JWL-SCA-001', 'Museum Reproductions Ltd.', 10, 'in-stock', 'Faithful reproduction of New Kingdom scarab amulet'],
      ['The Story of Art by E.H. Gombrich', 'Books', 35.00, 18.50, 75, 'BKS-GOB-001', 'Phaidon Press', 15, 'in-stock', 'Classic introduction to art history, 16th edition'],
      ['Impressionism Refrigerator Magnet Set', 'Souvenirs', 12.00, 3.00, 300, 'SOV-MAG-001', 'Gift Concepts Inc.', 50, 'in-stock', 'Set of 6 magnets featuring Impressionist masterworks'],
      ['Museum Collection Silk Scarf', 'Apparel', 85.00, 28.00, 35, 'APP-SCF-001', 'Silk Heritage Designs', 8, 'in-stock', 'Hand-printed silk scarf inspired by Japanese woodblock prints'],
      ['Hieroglyphic Rubber Stamp Kit', 'Children', 16.00, 4.50, 90, 'CHD-STP-001', 'Educraft Supplies', 20, 'in-stock', 'Educational stamp set with 12 Egyptian hieroglyphs and ink pad'],
      ['Architect\'s Sketch Journal', 'Stationery', 28.00, 9.00, 60, 'STN-JRN-001', 'Leuchtturm Wholesale', 12, 'in-stock', 'Hardcover dot-grid journal with museum building on cover'],
      ['Greek Column Bookends (Pair)', 'Home', 55.00, 22.00, 25, 'HOM-BKE-001', 'Classic Home Décor', 6, 'in-stock', 'Cast resin Ionic column bookends with marble finish'],
      ['Curator\'s Choice Chocolate Box', 'Specialty', 32.00, 14.00, 40, 'SPC-CHO-001', 'Artisan Chocolates Ltd.', 10, 'in-stock', 'Handcrafted truffles in a box featuring museum collection highlights'],
      ['Van Gogh Starry Night Umbrella', 'Accessories', 38.00, 11.00, 55, 'ACC-UMB-001', 'RainArt Imports', 10, 'in-stock', 'Compact folding umbrella with full Starry Night canopy print'],
      ['Ancient Civilizations LEGO Set', 'Children', 42.00, 24.00, 8, 'CHD-LEG-001', 'Museum Exclusive LEGO', 10, 'low-stock', 'Custom museum-exclusive set featuring pyramids and temples'],
      ['Monet\'s Garden Seed Collection', 'Specialty', 18.00, 5.50, 0, 'SPC-GDN-001', 'Heritage Seed Co.', 15, 'out-of-stock', 'Flower seeds inspired by Monet\'s Giverny garden'],
      ['Art History Timeline Poster', 'Prints', 24.00, 7.00, 85, 'PRT-TML-001', 'Museum Art Prints Co.', 15, 'in-stock', 'Illustrated timeline from cave paintings to contemporary art'],
      ['Museum Member Lapel Pin', 'Accessories', 15.00, 3.50, 150, 'ACC-PIN-001', 'PinCraft Studio', 25, 'in-stock', 'Enamel pin with museum crest, exclusive to members'],
    ];
    for (const g of giftShopValues) {
      await client.query(
        'INSERT INTO gift_shop_items (name, category, price, cost, quantity, sku, supplier, reorder_point, status, description) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
        g
      );
    }
    console.log('  Seeded gift_shop_items');

    // ── SEED EVENTS ──
    const eventsValues = [
      ['Annual Spring Gala', 'gala', '2025-04-12', '18:30', '23:00', 'Grand Hall', 350, 285, 500.00, 'upcoming', 'Victoria Harrington', 'Black-tie fundraiser. Theme: Gardens of Impressionism.'],
      ['Art and Astronomy: Painting the Night Sky', 'lecture', '2025-03-27', '18:00', '19:30', 'Auditorium', 200, 145, 15.00, 'upcoming', 'Dr. Sarah Mitchell', 'Guest speaker: Prof. Brian Cox.'],
      ['Watercolor Workshop for Beginners', 'workshop', '2025-04-05', '10:00', '13:00', 'Education Studio A', 20, 18, 75.00, 'upcoming', 'Jennifer Davis', 'All materials included. Led by artist Maya Torres.'],
      ['New Exhibition Opening Reception', 'reception', '2025-04-14', '17:00', '20:00', 'Modern Wing Gallery A', 250, 210, 0.00, 'upcoming', 'Emily Watson', 'Silk Road Connections exhibition opening. Members and press.'],
      ['Corporate Evening: Meridian Corp.', 'corporate', '2025-05-10', '18:00', '22:00', 'Grand Hall', 200, 200, 0.00, 'confirmed', 'William Garcia', 'Private corporate event. Catering by Chef Laurent.'],
      ['Summer Concert Series: Jazz in the Garden', 'concert', '2025-06-14', '19:00', '21:30', 'Outdoor Sculpture Garden', 400, 120, 35.00, 'upcoming', 'Daniel Martinez', 'Featuring the Metropolitan Jazz Quartet.'],
      ['Film Screening: The Art of Forgery', 'screening', '2025-03-29', '14:00', '16:30', 'Auditorium', 150, 98, 10.00, 'upcoming', 'Michael Brown', 'Documentary followed by panel discussion.'],
      ['Donor Appreciation Dinner', 'fundraiser', '2025-05-03', '19:00', '22:00', 'Founders Gallery', 80, 72, 0.00, 'confirmed', 'Victoria Harrington', 'Invitation-only event for Patron level and above.'],
      ['Wedding Ceremony: Park-Williams', 'rental', '2025-06-21', '15:00', '23:00', 'Sculpture Court', 150, 150, 15000.00, 'confirmed', 'Nicole Taylor', 'Full venue rental. Setup begins at 10:00.'],
      ["Children's Art Day", 'workshop', '2025-04-19', '10:00', '15:00', "Children's Gallery", 100, 67, 0.00, 'upcoming', 'Jennifer Davis', 'Free family event. Activities include painting, sculpting, and treasure hunts.'],
      ['Conservation Talk: Behind the Scenes', 'lecture', '2025-04-10', '12:00', '13:00', 'Conservation Lab', 30, 30, 20.00, 'confirmed', 'Dr. Elena Rossi', 'Lunchtime talk with live demonstration.'],
      ['Annual Awards Ceremony', 'ceremony', '2025-09-20', '17:00', '20:00', 'Grand Hall', 300, 0, 0.00, 'upcoming', 'Admin User', 'Staff and volunteer recognition awards.'],
      ['Photography Masterclass', 'workshop', '2025-05-17', '09:00', '16:00', 'Photography Gallery', 15, 12, 150.00, 'upcoming', 'Emily Watson', 'Full-day workshop with photographer Annie Leibovitz.'],
      ['Heritage Month Fundraiser Dinner', 'fundraiser', '2025-10-18', '19:00', '22:30', 'Grand Hall', 250, 0, 250.00, 'upcoming', 'Daniel Martinez', 'Celebrating cultural heritage with keynote by museum director.'],
      ['Museum After Dark: Night at the Museum', 'reception', '2025-05-31', '20:00', '00:00', 'Main Building', 500, 340, 45.00, 'upcoming', 'William Garcia', 'Special after-hours event with live music, cocktails, and gallery access.'],
    ];
    for (const e of eventsValues) {
      await client.query(
        'INSERT INTO events (name, type, date, start_time, end_time, location, capacity, registered, price, status, contact, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)',
        e
      );
    }
    console.log('  Seeded events');

    // ── SEED EDUCATION_PROGRAMS ──
    const educationValues = [
      ['Art Explorers Summer Camp', 'camp', 'Ages 6-12', 'Maya Torres', 'Mon-Fri, June 16-27, 9:00-15:00', 30, 24, 350.00, 'upcoming', 'Two-week camp exploring drawing, painting, sculpture, and printmaking through museum collections', 'Sketchbooks, paints, clay, aprons provided'],
      ['Introduction to Art History', 'lecture', 'Adults', 'Dr. Sarah Mitchell', 'Tuesdays, 18:00-19:30, 10-week series', 40, 38, 200.00, 'active', 'Survey course from ancient civilizations to contemporary art with gallery visits', 'Slide presentations, reading list, gallery handouts'],
      ['Family Sunday Art Workshop', 'family', 'All ages', 'Jennifer Davis', 'Sundays, 13:00-15:00', 25, 20, 0.00, 'active', 'Drop-in workshop for families inspired by current exhibitions', 'Art supplies, activity sheets'],
      ['Docent Training Program', 'class', 'Adults 18+', 'Robert Kim', 'Saturdays, 10:00-12:00, 16-week course', 15, 15, 0.00, 'active', 'Comprehensive training for new volunteer docents covering collections, public speaking, and tour design', 'Training manual, collection guides, presentation materials'],
      ['Teacher Professional Development', 'teacher', 'K-12 Educators', 'Jennifer Davis', '3 full-day sessions: July 8, 9, 10', 25, 18, 0.00, 'upcoming', 'Strategies for integrating museum resources into classroom curriculum. CEU credits available.', 'Curriculum guides, resource packets, digital access'],
      ['Sketching in the Galleries', 'workshop', 'Ages 16+', 'Maya Torres', 'Wednesdays, 10:00-12:00', 20, 16, 45.00, 'active', 'Guided sketching sessions in different galleries each week', 'Pencils and sketchpads provided; easels available'],
      ['Conservation Science Seminar', 'seminar', 'Graduate students', 'Dr. Elena Rossi', 'Monthly, first Friday, 14:00-16:00', 20, 12, 0.00, 'active', 'Advanced seminar exploring the science behind art conservation techniques', 'Lab access, analytical equipment demonstrations'],
      ['Toddler Time: Art for Little Ones', 'family', 'Ages 2-5', 'Amanda Foster', 'Thursdays, 10:00-11:00', 15, 14, 10.00, 'active', 'Sensory art experiences for toddlers and caregivers', 'Non-toxic paints, sensory materials, smocks'],
      ['Community Outreach: Art in the Park', 'outreach', 'All ages', 'Daniel Martinez', 'Second Saturday of each month, 11:00-14:00', 100, 0, 0.00, 'active', 'Free art-making activities in local parks bringing the museum to the community', 'Portable art supplies, canopy tents, signage'],
      ['Virtual Museum Tour Series', 'online', 'All ages', 'Christopher Lee', 'Bi-weekly Wednesdays, 12:00-13:00', 200, 85, 0.00, 'active', 'Live-streamed gallery tours with Q&A, accessible worldwide', 'Streaming equipment, platform subscription'],
      ['Photography Basics', 'workshop', 'Ages 16+', 'Emily Watson', 'Saturdays, 14:00-16:00, 6-week course', 12, 12, 180.00, 'active', 'Hands-on course covering composition, lighting, and digital techniques', 'DSLR cameras available for loan, editing software'],
      ['Ancient Cultures for Kids', 'camp', 'Ages 8-14', 'Dr. Maria Gonzalez', 'Mon-Fri, July 14-18, 9:00-15:00', 25, 10, 200.00, 'upcoming', 'One-week camp exploring Egyptian, Greek, and Mesoamerican cultures', 'Craft materials, replica artifacts, activity books'],
      ['Museum Studies Internship Seminar', 'seminar', 'College students', 'Michael Brown', 'Ongoing, flexible schedule', 10, 8, 0.00, 'active', 'Supervised internship with weekly seminars on museum practice', 'Reading assignments, project guidelines'],
      ['Meditation and Art', 'workshop', 'Adults', 'Patricia Wang', 'Fridays, 08:00-09:00', 20, 17, 15.00, 'active', 'Guided meditation sessions in the galleries combining mindfulness with art appreciation', 'Yoga mats, meditation cushions'],
      ['ASL Gallery Tours', 'tour', 'Deaf/HoH community', 'Christopher Lee', 'First Sunday of each month, 14:00-15:30', 15, 8, 0.00, 'active', 'Gallery tours conducted in American Sign Language', 'Visual aids, printed materials'],
    ];
    for (const e of educationValues) {
      await client.query(
        'INSERT INTO education_programs (name, type, age_group, instructor, schedule, capacity, enrolled, fee, status, description, materials) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
        e
      );
    }
    console.log('  Seeded education_programs');

    // ── SEED VOLUNTEERS ──
    const volunteersValues = [
      ['Margaret Thornton', 'm.thornton@email.com', '555-0301', 'docent', 'active', '2022-03-15', 520.0, 'Tue, Thu, Sat', 'Art history MA, public speaking, bilingual English/French', 'Docent certification, First Aid'],
      ['Harold Winters', 'h.winters@email.com', '555-0302', 'guide', 'active', '2023-01-10', 340.0, 'Wed, Fri, Sun', 'Retired teacher, storytelling, group management', 'Docent certification'],
      ['Susan Park', 's.park@email.com', '555-0303', 'greeter', 'active', '2024-06-01', 95.0, 'Mon, Wed, Fri', 'Customer service, multilingual Korean/English', null],
      ['David Okafor', 'd.okafor@email.com', '555-0304', 'education', 'active', '2023-09-01', 280.0, 'Tue, Thu', 'Elementary education degree, art therapy', 'Teaching certificate, CPR'],
      ['Nancy Liu', 'n.liu@email.com', '555-0305', 'shop', 'active', '2024-01-15', 160.0, 'Sat, Sun', 'Retail experience, inventory management', 'Cash handling'],
      ['Robert Hernandez', 'r.hernandez@email.com', '555-0306', 'events', 'active', '2023-05-20', 210.0, 'Flexible', 'Event planning, catering coordination, setup/teardown', 'Food safety certification'],
      ['Elena Petrov', 'e.petrov@email.com', '555-0307', 'conservation', 'training', '2025-01-15', 30.0, 'Mon, Wed', 'Chemistry background, fine motor skills, detail-oriented', 'Lab safety training (in progress)'],
      ['James Whitaker', 'j.whitaker@email.com', '555-0308', 'research', 'active', '2022-08-01', 450.0, 'Mon-Fri', 'PhD candidate in art history, archival research', 'Library certification'],
      ['Patricia Washington', 'p.washington@email.com', '555-0309', 'admin', 'active', '2024-03-01', 125.0, 'Tue, Thu', 'Office administration, data entry, phone skills', null],
      ['Thomas Chen', 't.chen@email.com', '555-0310', 'security', 'active', '2023-11-01', 380.0, 'Rotating', 'Former military, observation skills, conflict de-escalation', 'Security clearance, First Aid, CPR'],
      ['Maria Santos', 'ma.santos@email.com', '555-0311', 'docent', 'active', '2024-02-15', 145.0, 'Wed, Sat', 'Art history BA, enthusiastic, bilingual Spanish/English', 'Docent certification'],
      ['George Palmer', 'g.palmer@email.com', '555-0312', 'guide', 'on-leave', '2022-11-01', 410.0, 'N/A', 'Deep knowledge of Egyptian collection, engaging presenter', 'Docent certification, First Aid'],
      ['Linda Nakamura', 'l.nakamura@email.com', '555-0313', 'education', 'active', '2024-09-01', 75.0, 'Fri, Sat', 'Early childhood education, crafts, patience', 'CPR, Child safety'],
      ['Christopher Reed', 'c.reed@email.com', '555-0314', 'events', 'inactive', '2023-07-15', 185.0, 'N/A', 'AV equipment, sound engineering, photography', null],
      ['Diane Foster', 'd.foster@email.com', '555-0315', 'greeter', 'active', '2025-02-01', 20.0, 'Mon, Thu, Sat', 'Friendly, organized, accessibility awareness', 'Disability awareness training'],
    ];
    for (const v of volunteersValues) {
      await client.query(
        'INSERT INTO volunteers (name, email, phone, role, status, start_date, hours_completed, availability, skills, certifications) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
        v
      );
    }
    console.log('  Seeded volunteers');

    // ── SEED TOURS ──
    const toursValues = [
      ['Highlights of the Collection', '2025-03-24', '10:00', 1, 'general', 25, 18, 60, 0.00, 'available', 'English', 'Main Lobby Information Desk'],
      ['Impressionist Masterpieces Tour', '2025-03-24', '11:00', 1, 'general', 20, 20, 75, 15.00, 'full', 'English', 'Grand Hall Entrance'],
      ['Ancient Egypt: Life and Death', '2025-03-25', '10:30', 2, 'general', 25, 12, 60, 0.00, 'available', 'English', 'Egyptian Hall Entrance'],
      ['School Group: Renaissance Art', '2025-03-26', '09:30', 11, 'school', 30, 30, 90, 0.00, 'full', 'English', 'Main Lobby - Group Check-in'],
      ['VIP Curator\'s Tour', '2025-03-27', '14:00', null, 'VIP', 10, 8, 120, 75.00, 'available', 'English', 'Director\'s Office'],
      ['Private Group: Johnson Wedding Party', '2025-03-28', '16:00', 1, 'private', 20, 20, 90, 500.00, 'full', 'English', 'Sculpture Court'],
      ['Accessibility Tour: Touch and Describe', '2025-03-29', '11:00', 15, 'accessibility', 10, 6, 90, 0.00, 'available', 'English', 'Main Lobby - Accessibility Desk'],
      ['Behind the Scenes: Conservation Lab', '2025-03-30', '13:00', 8, 'behind-scenes', 8, 8, 60, 25.00, 'full', 'English', 'Staff Entrance, Side Door B'],
      ['Family Fun Tour', '2025-03-30', '10:00', 4, 'family', 30, 22, 45, 0.00, 'available', 'English', "Children's Gallery Entrance"],
      ['Photography Walk: Architecture', '2025-04-01', '09:00', null, 'photography', 15, 10, 120, 35.00, 'available', 'English', 'Outdoor Sculpture Garden Gate'],
      ['Curator-Led: Contemporary Art', '2025-04-02', '15:00', null, 'curator-led', 20, 14, 90, 30.00, 'available', 'English', 'Modern Wing Gallery A'],
      ['Virtual Tour: World Numismatics', '2025-04-03', '12:00', null, 'virtual', 100, 45, 60, 0.00, 'available', 'English', 'Online - Zoom Link'],
      ['Spanish Language Highlights Tour', '2025-03-25', '14:00', 11, 'general', 20, 9, 60, 0.00, 'available', 'Spanish', 'Main Lobby Information Desk'],
      ['School Group: Ancient Civilizations', '2025-04-04', '10:00', 2, 'school', 30, 28, 90, 0.00, 'available', 'English', 'Main Lobby - Group Check-in'],
      ['Evening Tour: Art After Dark', '2025-04-05', '19:00', 1, 'general', 25, 15, 75, 20.00, 'available', 'English', 'Main Lobby Information Desk'],
    ];
    for (const t of toursValues) {
      await client.query(
        'INSERT INTO tours (name, date, time, guide_id, type, capacity, booked, duration, price, status, language, meeting_point) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)',
        t
      );
    }
    console.log('  Seeded tours');

    // ── SEED VISITOR_ANALYTICS ──
    const analyticsValues = [
      ['2025-03-06', 1245, 180, 620, 195, 110, 85, 55, '11:00-12:00', 2.3, 'Impressionist Masters', 4.2, 18750.00, 'Thursday - steady attendance'],
      ['2025-03-07', 1580, 210, 780, 250, 140, 120, 80, '14:00-15:00', 2.5, 'Impressionist Masters', 4.3, 24200.00, 'Friday - strong afternoon traffic'],
      ['2025-03-08', 2340, 320, 1100, 420, 200, 150, 150, '11:00-12:00', 3.1, 'Impressionist Masters', 4.5, 38500.00, 'Saturday - peak day. Free admission for members drove traffic.'],
      ['2025-03-09', 2180, 290, 980, 450, 180, 130, 150, '13:00-14:00', 2.8, 'Treasures of the Nile', 4.4, 35200.00, 'Sunday - family day promotion'],
      ['2025-03-10', 890, 120, 450, 80, 95, 70, 75, '12:00-13:00', 2.0, 'Contemporary Visions', 4.1, 12800.00, 'Monday - lowest weekday attendance'],
      ['2025-03-11', 1050, 145, 520, 95, 105, 110, 75, '11:00-12:00', 2.1, 'Impressionist Masters', 4.2, 15300.00, 'Tuesday - student discount day'],
      ['2025-03-12', 1120, 155, 560, 110, 100, 115, 80, '11:00-12:00', 2.2, 'Impressionist Masters', 4.3, 16700.00, 'Wednesday - sketching group in galleries'],
      ['2025-03-13', 1180, 160, 590, 120, 110, 100, 100, '14:00-15:00', 2.2, 'Lens and Light', 4.1, 17400.00, 'Thursday - lecture series boost'],
      ['2025-03-14', 1650, 225, 820, 260, 145, 130, 70, '14:00-15:00', 2.6, 'Impressionist Masters', 4.4, 25800.00, 'Friday - after-work crowd strong'],
      ['2025-03-15', 2510, 340, 1180, 450, 210, 160, 170, '11:00-12:00', 3.2, 'Treasures of the Nile', 4.6, 41200.00, 'Saturday - new exhibition publicity boost'],
      ['2025-03-16', 2280, 310, 1020, 480, 190, 140, 140, '13:00-14:00', 2.9, 'Impressionist Masters', 4.5, 36800.00, 'Sunday - beautiful weather increased garden visits'],
      ['2025-03-17', 920, 130, 470, 85, 90, 80, 65, '12:00-13:00', 2.0, 'Contemporary Visions', 4.0, 13200.00, 'Monday - routine low day'],
      ['2025-03-18', 1080, 150, 540, 100, 100, 115, 75, '11:00-12:00', 2.1, 'Impressionist Masters', 4.2, 15800.00, 'Tuesday - two school groups visited'],
      ['2025-03-19', 1150, 160, 570, 115, 105, 120, 80, '12:00-13:00', 2.3, 'Classical Forms', 4.3, 17100.00, 'Wednesday - art history lecture drew extra visitors'],
      ['2025-03-20', 1200, 170, 600, 125, 110, 105, 90, '11:00-12:00', 2.2, 'Impressionist Masters', 4.2, 17900.00, 'Thursday - steady midweek performance'],
    ];
    for (const a of analyticsValues) {
      await client.query(
        'INSERT INTO visitor_analytics (date, total_visitors, members, adults, children, seniors, students, groups, peak_hour, avg_duration, top_exhibition, satisfaction_score, revenue, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)',
        a
      );
    }
    console.log('  Seeded visitor_analytics');

    // ── SEED SECURITY_ROUNDS ──
    const securityValues = [
      ['Officer James Rodriguez', '2025-03-20', '06:00', '08:00', 'West Wing - Levels 1-3', 'completed', 'All clear. Emergency exits verified.', 0, 24, 18, null],
      ['Officer Sarah Kim', '2025-03-20', '06:00', '08:00', 'East Wing - Levels 1-3', 'completed', 'Minor issue: Gallery 14 door sensor intermittent. Reported to maintenance.', 0, 22, 16, 'Door sensor issue logged as MR-2025-089.'],
      ['Officer Michael Torres', '2025-03-20', '08:00', '10:00', 'South Wing and Egyptian Hall', 'completed', 'All clear. Visitor flow normal at opening.', 0, 18, 12, null],
      ['Officer James Rodriguez', '2025-03-20', '10:00', '12:00', 'Central Areas and Sculpture Court', 'completed', 'Visitor attempted to touch sculpture in Gallery 4. Verbal warning issued.', 1, 20, 14, 'Incident report filed. Additional signage recommended.'],
      ['Officer David Chen', '2025-03-20', '12:00', '14:00', 'North Wing and Temporary Halls', 'completed', 'All clear. Lunch rush crowd managed well.', 0, 16, 10, null],
      ['Officer Sarah Kim', '2025-03-20', '14:00', '16:00', 'West Wing - Levels 1-3', 'completed', 'All clear. School group departed without incident.', 0, 24, 18, null],
      ['Officer Michael Torres', '2025-03-20', '16:00', '18:00', 'Full perimeter and exterior grounds', 'completed', 'All clear. Sculpture garden secured at 17:30.', 0, 30, 20, null],
      ['Officer Patricia Alvarez', '2025-03-20', '18:00', '22:00', 'Night patrol - Full building', 'completed', 'All clear. Building secured. Alarm system activated at 18:15.', 0, 48, 32, null],
      ['Officer David Chen', '2025-03-21', '06:00', '08:00', 'East Wing - Levels 1-3', 'completed', 'All clear. Gallery 14 sensor repaired overnight.', 0, 22, 16, null],
      ['Officer James Rodriguez', '2025-03-21', '08:00', '10:00', 'West Wing - Levels 1-3', 'completed', 'All clear.', 0, 24, 18, null],
      ['Officer Sarah Kim', '2025-03-21', '10:00', '12:00', 'South Wing and Egyptian Hall', 'completed', 'Water stain observed on ceiling near Gallery 6 east wall. Reported to maintenance.', 0, 18, 12, 'Possible pipe leak above. Maintenance notified urgently.'],
      ['Officer Michael Torres', '2025-03-21', '12:00', '14:00', 'Central Areas and Sculpture Court', 'in-progress', null, 0, 10, 8, 'Round in progress.'],
      ['Officer Patricia Alvarez', '2025-03-22', '06:00', '08:00', 'North Wing and Research Wing', 'scheduled', null, 0, 0, 0, null],
      ['Officer David Chen', '2025-03-22', '08:00', '10:00', 'Full perimeter and exterior grounds', 'scheduled', null, 0, 0, 0, null],
      ['Officer James Rodriguez', '2025-03-22', '18:00', '22:00', 'Night patrol - Full building', 'scheduled', null, 0, 0, 0, null],
    ];
    for (const s of securityValues) {
      await client.query(
        'INSERT INTO security_rounds (officer, date, start_time, end_time, zone, status, findings, incidents, doors_checked, cameras_reviewed, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
        s
      );
    }
    console.log('  Seeded security_rounds');

    // ── SEED MAINTENANCE_REQUESTS ──
    const maintenanceValues = [
      ['HVAC Unit #3 Malfunction - Grand Hall', 'Grand Hall', 'HVAC', 'high', 'in-progress', 'Officer Sarah Kim', 'TechServ HVAC Team', '2025-03-18', null, 2200.00, 'Temperature fluctuations reported in Grand Hall. Unit cycling irregularly. Affecting climate control for artworks.'],
      ['Gallery 14 Door Sensor Replacement', 'Modern Wing Gallery A', 'Electrical', 'medium', 'completed', 'Officer Sarah Kim', 'Building Electrician', '2025-03-20', '2025-03-20', 150.00, 'Intermittent door sensor detected during security round. Sensor replaced same day.'],
      ['Ceiling Water Stain - Egyptian Hall', 'Egyptian Hall', 'Plumbing', 'urgent', 'open', 'Officer Sarah Kim', null, '2025-03-21', null, null, 'Water stain on ceiling near east wall. Possible pipe leak. Artworks may be at risk.'],
      ['Lobby Floor Refinishing', 'Main Lobby', 'Cleaning', 'low', 'completed', 'Nicole Taylor', 'CleanPro Services', '2025-02-15', '2025-02-20', 4500.00, 'Annual marble floor polishing and sealing. Scheduled during low-traffic period.'],
      ['Elevator #2 Annual Inspection', 'Main Building', 'Elevator', 'medium', 'completed', 'Building Manager', 'Otis Elevator Co.', '2025-01-10', '2025-01-10', 800.00, 'Passed inspection. Certificate valid through January 2026.'],
      ['Exterior Painting - South Facade', 'Exterior - South', 'Painting', 'low', 'deferred', 'Daniel Martinez', null, '2025-02-01', null, 12000.00, 'Paint peeling on south facade. Deferred to spring when weather permits.'],
      ['Fire Alarm Panel Update', 'Main Building', 'Fire Safety', 'high', 'completed', 'Fire Marshal', 'FireTech Systems', '2025-01-20', '2025-02-15', 18500.00, 'Updated fire alarm panel to current code requirements. All zones tested and certified.'],
      ['Sculpture Garden Irrigation Repair', 'Outdoor Sculpture Garden', 'Plumbing', 'medium', 'completed', 'Grounds Keeper', 'GreenScape Landscaping', '2025-03-05', '2025-03-08', 1200.00, 'Three sprinkler heads broken during winter. Replaced and system flushed.'],
      ['WiFi Network Expansion - Education Wing', 'Education Wing', 'IT', 'medium', 'in-progress', 'William Garcia', 'Museum IT Department', '2025-03-10', null, 3500.00, 'Adding access points to support virtual tour streaming and educational programs.'],
      ['Restroom Renovation - Level 2 West', 'Main Building Level 2', 'Plumbing', 'medium', 'completed', 'Building Manager', 'Premier Plumbing', '2025-01-05', '2025-02-28', 35000.00, 'Complete renovation of west wing restrooms. ADA compliance upgrades included.'],
      ['LED Lighting Upgrade - Renaissance Gallery', 'Renaissance Gallery', 'Electrical', 'medium', 'completed', 'Dr. Sarah Mitchell', 'Lutron Lighting', '2025-02-10', '2025-02-25', 8900.00, 'Replaced halogen track lighting with museum-grade LED. Improved color rendering and energy savings.'],
      ['Structural Assessment - Loading Dock', 'Annex Building', 'Structural', 'high', 'completed', 'Building Manager', 'StructuralSafe Engineering', '2025-01-15', '2025-01-20', 2500.00, 'Crack observed in loading dock floor. Engineer assessed as cosmetic. Sealed and monitored.'],
      ['Landscaping - Spring Planting', 'Exterior Grounds', 'Landscaping', 'low', 'open', 'Grounds Keeper', 'GreenScape Landscaping', '2025-03-15', null, 6000.00, 'Annual spring planting for entrance gardens and sculpture garden borders.'],
      ['Emergency Exit Light Replacement - Basement', 'Main Building Basement', 'Electrical', 'high', 'completed', 'Fire Marshal', 'Building Electrician', '2025-03-01', '2025-03-02', 450.00, 'Four emergency exit lights with dead batteries replaced. Code compliance restored.'],
      ['Climate Control Calibration - Textile Gallery', 'Textile Conservation Gallery', 'HVAC', 'high', 'in-progress', 'Akiko Tanaka', 'TechServ HVAC Team', '2025-03-19', null, 1800.00, 'Humidity readings 3% above target. System recalibration needed before gallery reopens from renovation.'],
    ];
    for (const m of maintenanceValues) {
      await client.query(
        'INSERT INTO maintenance_requests (title, location, type, priority, status, reported_by, assigned_to, reported_date, completed_date, cost, description) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
        m
      );
    }
    console.log('  Seeded maintenance_requests');

    console.log('\nSeeding complete! All 21 tables created and populated.');
  } catch (err) {
    console.error('Seeding failed:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
