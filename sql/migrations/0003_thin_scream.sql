CREATE TRIGGER set_subscriptions_updated_at -- <- name of the trigger
BEFORE UPDATE ON subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();