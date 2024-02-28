import handleGameRedirect from "./handleGameRedirect.js";
import handleShowTable from "./handleShowTable.js";
import popupTogle from "./table/popup/popupToggle.js";

export default function vocabInit() {
    handleShowTable();
    handleGameRedirect();
    popupTogle();
}