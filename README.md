# Lingo-Assist
A Chrome extension to assist learning languages with Duolingo. 

## Note
Duolingo has killed the public Vocabulary API this extension uses to retrieve the users vocab. I'm looking into fixes. 

## Extension
The extension is written using plain JavaScript, HTML and CSS. There is code for the Options page, Game page, popup, content script and service worker. Below is gif of different parts of the extension. 
![](https://raw.githubusercontent.com/Joheb133/Lingo-Assist/main/images/lingo-assist.gif)

## Backend
This project uses Azure Serverless Functions, the code for this is in the backend folder. The backend handles translations powered by Wiktionaries REST API. 

## Intructions
To run the project locally, two things must be done. First, go into extensions, enable developer mode and click the "unpack" button. When prompted, locate the extension folder. To use Azure Functions locally, install the Azure functions extension in Visual Studio Code, open the terminal and make sure you're in the backend folder, run `npm i` then `npm start`. 
