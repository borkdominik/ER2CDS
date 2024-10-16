<!-- TITLE -->
<h1 align="center">ER2CDS</h1>

<!-- BADGES -->
<p align="center">
  <img alt="GitHub contributors" src="https://img.shields.io/github/contributors/borkdominik/ER2CDS?color=lightgrey" height="20"/>
</p>

<!-- DESCRIPTION -->
<p align="center">
  <b>Open-source SAP CDS modeling tool for VS Code supporting hybrid, textual- and graphical editing!</b></br>
</p>

<!-- DEMO -->
<p align="center">
  <img src="https://github.com/user-attachments/assets/b10a1a8e-2ccb-40cc-9262-84a3a96fb491" alt="Demo" width="800" />
</p>

**Main features:**
- **📝 Textual Language** for the specification of ER2CDS models in the textual editor. Assistive *validation* and *rich-text editing* support, enabled with the [Language Server Protocol](https://microsoft.github.io/language-server-protocol/), allows to quickly get familiar with the available language constructs.
- 📊 **Diagram View** that is fully synchronized with the textual model and automatically updates on changes. Also offers an interactive toolbar with *graphical editing actions*, *layout mechanisms*, and *multi-notation support*
- 🖨️ **Code Generation** to *generate CDS view entities* out of the specified ER2CDS models and integrate with existing databases.
- 📥 **Import** of *existing CDS view entities* from a connected SAP S/4HANA system.

---
<br />	

**📖 Table of Contents**
1. [About the Project](#about-the-project)
2. [Usage](#usage)
3. [Build Instructions](#build-instructions)
4. [Issues](#issues)
5. [Contributing](#contributing)
6. [License](#license)
7. [Other Tools](#other-tools)
<br />	

## About the Project
ER2CDS aims to provide an open-source and modern solution for a model-driven development process of CDS by making use of the [Language Server Protocol (LSP)](https://microsoft.github.io/language-server-protocol/). The protocol is used for communicating textual language features to the VS Code client and is further extended to also support graphical editing. Additionally, a webservice deployed directly on a SAP S/4HANA system allows to integrate the system's datamodel into ER2CDS.

**Research**
The tool is based on extensive research. The evaluation results can be found in [Evaluation](../evaluation).

**Built With**
The language server is realized with [Langium](https://langium.org/), while the diagramming capabilities are based on [Sprotty](https://github.com/eclipse/sprotty). Sprotty enhances the server with graphical language features (using [`sprotty-server`](https://github.com/eclipse/sprotty-server)) and integrates with VS Code through [Sprotty VS Code Extensions](https://github.com/eclipse/sprotty-vscode). 


## Usage
Download and install the extension using the [.vsix](../er2cds-0.0.1.vsix) file provided in this repository.

```bash
code --install-extension er2cds-0.0.1.vsix
```

**New ER2CDS Model**
After installation, ER2CDS models can be created in `.er2cds` files. Use the example below to get started with a basic model.

```java
er2cds ZER2CDS_MANAGER

entity Employee {
   key PERNR : NUMC
   FNAME : CHAR as FirstName
   LNAME : CHAR as LastName
   DEPARTMENT_ID : NUMC
}

entity Department {
   no-out DEPARTMENT_ID : NUMC
   NAME : CHAR as DepartmentName
   LOC : CHAR as Location
}

relationship manages {
   Employee[1] -> Department[1]
   join order 1
   DEPARTMENT_ID = DEPARTMENT_ID
}
```

**Open the Diagram**
The corresponding *ER2CDS Diagram* can be opened by using the button in the editor toolbar, the context menu when right-clicking the file, or by pressing <kbd>Ctrl</kbd>/<kbd>⌘</kbd> + <kbd>O</kbd>.

**(Optional) Connect SAP S/4HANA**
1. Create the [CDS view entities](../odata-service/)
2. Create the [Service Definition](../odata-service/ZER2CDS.sdef)
3. Create a Service Binding (ZER2CDS) for the Service Definition
4. Publish the service under `/sap/opu/odata/sap/ZER2CDS`

**Learn More**
For more information on how to use the tool, see the [ER2CDS Wiki](https://github.com/borkdominik/ER2CDS/wiki/).


## Build Instructions
**Prerequisites**
- [Node.js](https://nodejs.org/en/) 20 or above
- [VS Code](https://code.visualstudio.com/) v1.86.0 or above

Download or clone the repository and in the root folder of the project execute the following commands:

```bash
npm run build --prefix ./extension 
npm run build --prefix ./language-server 
npm run build --prefix ./webview
```

The project can be run in development mode in VS Code by pressing <kbd>F5</kbd> or selecting `Run ➜ Start Debugging` from the menu.


## Issues
Project issues are managed on GitHub, see [Open Issues](https://github.com/borkdominik/ER2CDS/issues) for the currently tracked issues. Do not hesitate to report a bug or request a feature through the offered [Issue Templates](https://github.com/borkdominik/ER2CDS/issues/new/choose). For questions, simply use a blank issue.


## Contributing
Contributions to the project are always welcome!

**Contributors**:
- [Gallus Huber](https://github.com/GallusHuber) (main developer)   
- [Dominik Bork](https://github.com/borkdominik)

See [All Contributors](https://github.com/borkdominik/ER2CDS/graphs/contributors).

If you like our work, please feel free to [buy us a coffee](https://buymeacoffee.com/er2cds) ☕️

<a href="https://buymeacoffee.com/er2cds" target="_blank">
  <img src="https://www.buymeacoffee.com/assets/img/custom_images/yellow_img.png" alt="Logo" >
</a>


## License
The project is distributed under the MIT License. See [License](https://github.com/borkdominik/ER2CDS/blob/main/LICENSE) for more details.


## Other Tools
Check out our other modeling tools!

<a href="https://marketplace.visualstudio.com/items?itemName=BIGModelingTools.erdiagram"><img src="https://bigmodelingtools.gallerycdn.vsassets.io/extensions/bigmodelingtools/erdiagram/0.5.0/1698169469481/Microsoft.VisualStudio.Services.Icons.Default" alt="bigER Logo" height="120" width="120" /></a>

<a href="https://marketplace.visualstudio.com/items?itemName=BIGModelingTools.umldiagram"><img src="https://bigmodelingtools.gallerycdn.vsassets.io/extensions/bigmodelingtools/umldiagram/0.4.0/1696184688299/Microsoft.VisualStudio.Services.Icons.Default" alt="bigUML Logo" height="120" width="120" /></a>
