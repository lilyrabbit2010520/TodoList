const { ipcRenderer } = require('electron');
const electron = require('electron');

const { app, BrowserWindow, Menu ,ipcMain } = electron;

let mainWindow;
let addWindow;

app.on('ready',() => {
    mainWindow = new BrowserWindow({ 
        webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
    }});
    mainWindow.loadURL(`file://${__dirname}/main.html`);
    // Close entire application
    mainWindow.on('closed',() => app.quit());

    const mainMenu=Menu.buildFromTemplate(menuTemplate);
    //pass the main menu that is created.
    Menu.setApplicationMenu(mainMenu);
});

function createAddWindow(){
    addWindow=new BrowserWindow({
        width:300,
        height:200,
        title:'Add New Todo',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    });

    addWindow.loadURL(`file://${__dirname}/add.html`);
    // Garbage collection to reclainthe memory
    addWindow.on('close',() => addWindow = null);
}

//receive from add.html and sent to the mainWindow
ipcMain.on('todo:add',(event,todo)=>{
    mainWindow.webContents.send('todo:add',todo);
    //close has problem with reclain the memory
    addWindow.close();
    //reclain the memory let addWindow point to null(one way)
    //addWindow = null;
    //second way to reclain the memory is close in the function createAddWindow()
});



const menuTemplate=[
    {label:''},
    {
        label:'File',
        submenu:[
            {
                label:'New Todo',
                click(){
                     createAddWindow();
                 }
            },
            {
                label:'Clear Todos',
                click(){
                    mainWindow.webContents.send('todo:clear');
                }
            },
            {
                label:'Quit',
                //1. Hot key1
                //accelerator:'Ctrl+Q',
                //2. Hot key2,invoke function
                // accelerator:(()=>{
                //     if(process.platform==='darwin'){
                //         return 'Command+Q';
                //     }else{
                //         return 'Ctrl+Q';
                //     }
                // })(),
                //3. ternary expression
                accelerator: process.platform==='darwin'?'Command+Q':'Ctrl+Q',
                click(){
                    app.quit();
            }
        }

        ]
    }
];

if(process.platform==='win32'){
    menuTemplate.unshift({label:''});
}

if(process.env.NODE_ENV!=='production'){
    //'production'
    //'development'
    //'staging'
    //'test'
    menuTemplate.push({
        label:'view',
        submenu:[
            {role:'reload'},
            {
                label:'Toggle Developer Tools',
                accelerator:process.platform==='darwin'?'Command+Alt+I':'Ctrl+Shift+I',
                click(item,focusedWindow){
                    focusedWindow.toggleDevTools();
                }
            }
        ]
    })
}