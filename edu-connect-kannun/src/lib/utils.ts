import {clsx, type ClassValue} from "clsx";
import {twMerge} from "tailwind-merge";

// Utility function to merge class names...
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

