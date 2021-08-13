const electron = window.require('electron');


export const menuItemsEnabler = (editMode: boolean) => {
    const menu = electron.remote.Menu.getApplicationMenu()
    menu.getMenuItemById('menu-save').enabled = editMode
    menu.getMenuItemById('menu-save-as').enabled = editMode
    menu.getMenuItemById('menu-close').enabled = editMode

    menu.getMenuItemById('export-c').enabled = editMode
    menu.getMenuItemById('export-vhdl').enabled = editMode
    menu.getMenuItemById('export-excel').enabled = editMode
    menu.getMenuItemById('combine-excel').enabled = editMode

    menu.getMenuItemById('menu-open-file').enabled = !editMode
    menu.getMenuItemById('menu-new-project').enabled = !editMode
}

export const setElectronTitle = (title: string) => {
    electron.remote.getCurrentWindow().setTitle(title)
}

