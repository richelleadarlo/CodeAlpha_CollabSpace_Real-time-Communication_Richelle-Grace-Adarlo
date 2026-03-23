import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupStorage() {
  try {
    console.log('Creating profile-avatars bucket...');

    // Try to create the bucket
    const { data, error } = await supabase.storage.createBucket('profile-avatars', {
      public: true,
    });

    if (error) {
      if (error.message?.includes('already exists')) {
        console.log('✓ profile-avatars bucket already exists');
      } else {
        console.error('Error creating bucket:', error.message);
        process.exit(1);
      }
    } else {
      console.log('✓ profile-avatars bucket created successfully');
    }

    console.log('✓ Storage setup complete!');
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

setupStorage();
