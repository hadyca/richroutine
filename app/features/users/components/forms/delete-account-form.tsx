import type { Route } from "@rr/app/features/users/api/+types/delete-account";

import { Loader2Icon } from "lucide-react";
import { useState } from "react";
import { useFetcher } from "react-router";

import FormErrors from "~/core/components/form-error";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/core/components/ui/alert-dialog";
import { Button } from "~/core/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/core/components/ui/card";
import { Checkbox } from "~/core/components/ui/checkbox";
import { Label } from "~/core/components/ui/label";

export default function DeleteAccountForm() {
  const fetcher = useFetcher<Route.ComponentProps["actionData"]>();
  const [isDeleteConfirmed, setIsDeleteConfirmed] = useState(false);
  const [isIrreversibleConfirmed, setIsIrreversibleConfirmed] = useState(false);

  const canDelete = isDeleteConfirmed && isIrreversibleConfirmed;
  return (
    <Card className="w-full max-w-screen-md bg-red-100 dark:bg-red-900/40">
      <CardHeader>
        <CardTitle>계정 삭제</CardTitle>
      </CardHeader>
      <CardContent>
        <fetcher.Form
          method="delete"
          className="space-y-4"
          action="/api/users"
          id="delete-account-form"
        >
          <Label>
            <Checkbox
              id="confirm-delete"
              name="confirm-delete"
              required
              checked={isDeleteConfirmed}
              onCheckedChange={(checked) =>
                setIsDeleteConfirmed(checked as boolean)
              }
              className="border-black dark:border-white"
            />
            이 계정을 삭제하고 싶습니다.
          </Label>
          <Label>
            <Checkbox
              id="confirm-irreversible"
              name="confirm-irreversible"
              required
              checked={isIrreversibleConfirmed}
              onCheckedChange={(checked) =>
                setIsIrreversibleConfirmed(checked as boolean)
              }
              className="border-black dark:border-white"
            />
            이 작업은 되돌릴 수 없습니다.
          </Label>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant={"destructive"}
                className="w-full"
                type="button"
                disabled={fetcher.state === "submitting" || !canDelete}
              >
                계정 삭제
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  정말 계정을 삭제하시겠습니까?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  계정에 저장된 모든 데이터가 영구적으로 삭제되며, 이 작업은
                  되돌릴 수 없습니다.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>취소</AlertDialogCancel>
                <Button
                  form="delete-account-form"
                  type="submit"
                  variant="destructive"
                  disabled={fetcher.state === "submitting"}
                >
                  {fetcher.state === "submitting" ? (
                    <Loader2Icon className="ml-2 size-4 animate-spin" />
                  ) : (
                    "계정 삭제"
                  )}
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          {fetcher.data?.error ? (
            <FormErrors errors={[fetcher.data.error]} />
          ) : null}
        </fetcher.Form>
      </CardContent>
    </Card>
  );
}
