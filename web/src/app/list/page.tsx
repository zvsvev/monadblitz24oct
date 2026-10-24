import { ListForm } from "@/components/list-form";

export default function ListPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-extrabold text-eel">List on the board</h1>
      <ListForm />
    </div>
  );
}
