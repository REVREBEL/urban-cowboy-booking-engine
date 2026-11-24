import { redirect } from "next/navigation";

/** Direct admin entry; the destination section applies the session guard. */
export default function AdminEntry() {
  redirect("/rooms");
}
