CREATE TRIGGER set_economy_indices_updated_at
BEFORE UPDATE ON economy_indices
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();