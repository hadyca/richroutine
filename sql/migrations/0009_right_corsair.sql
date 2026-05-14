CREATE TRIGGER set_economy_analysis_updated_at
BEFORE UPDATE ON economy_analysis
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();