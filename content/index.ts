import type { Provider } from "@/lib/content/types";
import { gcp } from "./gcp/provider";

/** Every published provider. Add a provider here and its labs appear site-wide. */
export const providers: Provider[] = [gcp];
