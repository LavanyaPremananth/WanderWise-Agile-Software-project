import { Crypt } from "unpc";
import { SCryptHashingAdapter } from "unpc/scrypt";

export const crypt = new Crypt({
  adapters: [SCryptHashingAdapter],
  default: "scrypt",
});
