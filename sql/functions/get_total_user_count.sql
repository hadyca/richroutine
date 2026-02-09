-- Function to get total user count bypassing RLS
-- This function runs with SECURITY DEFINER which means it executes with the privileges 
-- of the user who created it, allowing it to bypass Row Level Security policies.
-- This is safe because it only returns a count, not actual user data.

CREATE OR REPLACE FUNCTION get_total_user_count()
RETURNS bigint
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT COUNT(*)::bigint FROM profiles;
$$;

-- Grant execute permission to authenticated users
-- This allows any logged-in user to call this function to see total user count
GRANT EXECUTE ON FUNCTION get_total_user_count() TO authenticated;

-- Optional: Also grant to anonymous users if you want to show stats on public pages
-- GRANT EXECUTE ON FUNCTION get_total_user_count() TO anon;
