document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput');
    const taskList = document.getElementById('taskList');
    const addTaskButton = document.getElementById('addTaskButton');
    const savedLists = document.getElementById('savedLists');
    const saveCurrentListButton = document.getElementById('saveCurrentListButton');

    const PRIORITY_ORDER = {
        "Alta": 1,
        "Media": 2,
        "Baja": 3,
        "Sin categoría": 4
    };

    // Función para cargar listas guardadas
    const loadSavedLists = () => {
        const lists = JSON.parse(localStorage.getItem('savedLists')) || [];
        savedLists.innerHTML = "";
        lists.forEach((list, index) => {
            const listItem = document.createElement('li');
            listItem.classList.add('list-item');
            listItem.innerHTML = `
                <span class="list-name">${list.name || `Lista ${index + 1}`}</span>
                <button class="edit-btn">✏️</button>
                <button class="delete-btn">❌</button>
            `;

            const listName = listItem.querySelector('.list-name');
            const editButton = listItem.querySelector('.edit-btn');
            const deleteButton = listItem.querySelector('.delete-btn');

            // Hacer el nombre editable cuando se presiona el botón de editar
            editButton.addEventListener('click', () => {
                listName.contentEditable = true;
                listName.focus();
            });

            // Guardar cambios cuando se pierde el foco
            listName.addEventListener('blur', () => {
                listName.contentEditable = false;
                lists[index].name = listName.innerText;
                localStorage.setItem('savedLists', JSON.stringify(lists));
            });

            // Eliminar la lista guardada
            deleteButton.addEventListener('click', () => {
                lists.splice(index, 1);  
                localStorage.setItem('savedLists', JSON.stringify(lists));  
                loadSavedLists();  
            });

            // Cargar las tareas de la lista al hacer clic en el nombre de la lista
            listItem.querySelector('.list-name').addEventListener('click', () => loadTaskList(list));

            savedLists.appendChild(listItem);
        });
    };

    // Función para guardar la lista actual (sin pedir nombre)
    const saveCurrentList = () => {
        const currentTasks = Array.from(taskList.children).map(item => ({
            text: item.querySelector('.task-text').innerText,
            category: item.dataset.category,
            completed: item.classList.contains('completed')
        }));

        const lists = JSON.parse(localStorage.getItem('savedLists')) || [];
        const listName = `Lista ${lists.length + 1}`; 
        lists.push({ name: listName, tasks: currentTasks });
        localStorage.setItem('savedLists', JSON.stringify(lists));
        loadSavedLists();
    };

    // Función para cargar una lista guardada
    const loadTaskList = (tasks) => {
        taskList.innerHTML = "";  
        tasks.tasks.forEach(task => addTaskToList(task.text, task.category, task.completed, false));
    };

    // Función para agregar una tarea a la lista
    const addTaskToList = (taskText, category = 'Sin categoría', completed = false, save = true) => {
        const listItem = document.createElement('li');
        listItem.dataset.category = category;
        if (completed) listItem.classList.add('completed');

        listItem.innerHTML = `
            <span class="task-text">${taskText}</span>
            <span class="task-category">${category}</span>
            <button class="delete-btn">Eliminar</button>
        `;

        const items = Array.from(taskList.children);
        const index = items.findIndex(item => 
            PRIORITY_ORDER[item.dataset.category] > PRIORITY_ORDER[category]
        );

        if (index === -1) {
            taskList.appendChild(listItem);
        } else {
            taskList.insertBefore(listItem, items[index]);
        }

        listItem.querySelector('.task-text').addEventListener('click', () => {
            listItem.classList.toggle('completed');
            saveTasks();
        });

        listItem.querySelector('.delete-btn').addEventListener('click', () => {
            listItem.remove();
            saveTasks();
        });

        if (save) saveTasks();
    };

    // Función para guardar las tareas
    const saveTasks = () => {
        const tasks = Array.from(taskList.children).map(item => ({
            text: item.querySelector('.task-text').innerText,
            category: item.dataset.category,
            completed: item.classList.contains('completed')
        }));
        localStorage.setItem('tasks', JSON.stringify(tasks));
    };

    // Agregar tarea nueva
    addTaskButton.addEventListener('click', () => {
        const taskText = taskInput.value.trim();
        const category = document.getElementById('taskCategory').value;
        if (taskText !== "") {
            addTaskToList(taskText, category);
            taskInput.value = "";
        }
    });

    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTaskButton.click();
        }
    });

    saveCurrentListButton.addEventListener('click', saveCurrentList);

    loadSavedLists();
});
