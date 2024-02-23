import handleClearVocab from "./handleClearVocab.js"
import handleSyncDuolingo from "./handleSyncDuolingo.js";
import handleTranslation from './handleTranslation.js'


export default function dashboardInit() {
    handleSyncDuolingo();
    handleTranslation();
    handleClearVocab();
}