CREATE TRIGGER set_tickers_updated_at
BEFORE UPDATE ON tickers
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();