import jsPDF from "jspdf";
import { UserOptions } from "jspdf-autotable"; // import correct types

declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: UserOptions) => jsPDF;
  }
}
