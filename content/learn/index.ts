import type { Course } from "@/lib/content/types";
import { fundamentals } from "./fundamentals/course";
import { gcp } from "./gcp/course";

/** The courses, in the order they are meant to be read. */
export const courses: Course[] = [fundamentals, gcp];
