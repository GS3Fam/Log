const
  electron = require('electron'),
  url = require('url'),
  path = require('path'),
  fs = require('fs'),
  {app, BrowserWindow, Menu, ipcMain} = electron,
  mongoose = require("mongoose"),
  makeId = require('./modules/makeId');

mongoose.connect("mongodb://admin:pass0424@ds129914.mlab.com:29914/timelog", {useNewUrlParser: true});

let w_main, w_recordForm, w_recordDel, w_recordInfo;
let Log = require("./models/log");

// Initial

app.on('ready', ()=>{
  fWindowMain();
  Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate));
})

// Windows

function fWindowMain(){
  w_main = new BrowserWindow({icon:'images/title_pic.png'})
  w_main.loadURL(url.format({
    pathname: path.join(__dirname, 'view', 'index.html'),
    protocol: 'file:',
    slashes: true
  }))
  w_main.on('closed', ()=>{
    app.quit()
  })
}
function fRecordForm(){
  w_recordForm ? w_recordForm.close() : 0
  w_recordForm = new BrowserWindow({
    icon:'images/title_pic.png',
    width: 300,
    height: 450,
    title: 'Add Record'
  })
  w_recordForm.setMenu(null)
  w_recordForm.loadURL(url.format({
    pathname: path.join(__dirname, 'view', 'recordForm.html'),
    protocol: 'file:',
    slashes: true
  }))
  w_recordForm.on('closed', ()=>{
    w_recordForm = null
  })
}
function fRecordDel(){
  w_recordDel ? w_recordDel.close() : 0
  w_recordDel = new BrowserWindow({
    icon:'images/title_pic.png',
    width: 300,
    height: 280,
    title: 'Delete Record'
  })
  w_recordDel.setMenu(null)
  w_recordDel.loadURL(url.format({
    pathname: path.join(__dirname, 'view', 'recordDel.html'),
    protocol: 'file:',
    slashes: true
  }))
  w_recordDel.on('closed', ()=>{
    w_recordDel = null
  })
}
function fRecordInfo(){
  w_recordInfo ? w_recordInfo.close() : 0
  w_recordInfo = new BrowserWindow({
    icon:'images/title_pic.png',
    width: 300,
    height: 280,
    title: 'Record Information'
  })
  w_recordInfo.setMenu(null)
  w_recordInfo.loadURL(url.format({
    pathname: path.join(__dirname, 'view', 'recordInfo.html'),
    protocol: 'file:',
    slashes: true
  }))
  w_recordInfo.on('closed', ()=>{
    w_recordInfo = null
  })
}

// Events

// -- GET all records
ipcMain.on('log:get', (e)=>{
  Log.find({}, (err, log)=>{
    w_main.webContents.send('log:get', log)
  })
})
// -- POST record action
ipcMain.on('log:post', (e, log)=>{
  w_recordForm ? w_recordForm.close() : 0
  log.id = makeId(8,'numbers');
  new Log(log).save(err => {
    console.log(err);
    Log.find({}, (err, log)=>{
      w_main.webContents.send('log:get', log)
    })
  })
})
// -- PUT record action
ipcMain.on('log:put', (e, log)=>{
  w_recordForm ? w_recordForm.close() : 0
  Log.findOneAndUpdate({id: log.id}, log, {upsert:true}, function(err, doc){
    console.log(err)
    Log.find({}, (err, log)=>{
      w_main.webContents.send('log:get', log)
    })
  });
})
// -- DEL record action
ipcMain.on('log:del', (e, log_id)=>{
  w_recordDel ? w_recordDel.close() : 0
  Log.deleteOne({ id: log_id }, function (err) {
    if (err) return res.send(err);
    Log.find({}, (err, log)=>{
      w_main.webContents.send('log:get', log)
    })
  });
})

// -- GET info window
ipcMain.on('log:w_info', (e, log_id)=>{
  fRecordInfo()
  Log.find({id: log_id}, (err, log)=>{
    w_recordInfo.webContents.send('log:w_info', log)
  })
})
// -- PUT record window
ipcMain.on('log:w_put', (e, log_id)=>{
  fRecordForm()
  Log.find({id: log_id}, (err, log)=>{
    w_recordForm.webContents.send('log:w_put', log)
  })
})
// -- DEL record window
ipcMain.on('log:w_del', (e, log_id)=>{
  fRecordDel()
  Log.find({id: log_id}, (err, log)=>{
    w_recordDel.webContents.send('log:w_del', log)
  })
})

// -- EXT record del window
ipcMain.on('log:x_del', (e, log_id)=>{
  w_recordDel ? w_recordDel.close() : 0
})
// -- EXT record info window
ipcMain.on('log:x_info', (e, log_id)=>{
  w_recordInfo ? w_recordInfo.close() : 0
})

// Menu

const menuTemplate = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Read From JSON',
        accelerator: process.platform == 'darwin' ? 'Command+N' : 'Ctrl+N',
        click(){
          fRecordForm()
        }
      },
      {
        label: 'Quit',
        accelerator: process.platform == 'darwin' ? 'Command+W' : 'Ctrl+W',
        click(){
          app.quit()
        }
      }
    ]
  }
]

if(process.env.NODE_ENV !== 'production'){
  menuTemplate.push({
    label: 'Dev Tools',
    submenu: [
      {
        label: 'Toggle Dev Tools',
        accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
        click(item, focusedWindow){
          focusedWindow.toggleDevTools();
        }
      },
      {
        role: 'reload'
      }
    ]
  })
}
