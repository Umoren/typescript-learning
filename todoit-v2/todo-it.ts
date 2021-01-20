// Implementing the MODEL

class TodoItem {
    private readonly _creationTimestamp: number;
    private readonly _identifier: string;

    constructor(private _description: string, identifier?: string ){
        this._creationTimestamp = new Date().getTime();

        if (identifier) {
            this._identifier = identifier
        } else {
            this._identifier = Math.random().toString(36).substr(2,9)
        }
    }

    get creationTimestamp(): number {
        return this._creationTimestamp;
    }

    get identifier(): string {
        return this._identifier
    }

    get description(): string {
        return this._description;
    }
}

class TodoList {
    private _todoList: ReadonlyArray<TodoItem> = []

    constructor(todoList?: TodoItem[]){
        if(Array.isArray(todoList) && todoList.length) {
            this._todoList = this._todoList.concat(todoList);
        }
    }

    get todoList() : ReadonlyArray<TodoItem>{
        return this._todoList
    }

    addTodo(todoItem: TodoItem) {
        if (todoItem) {
            this._todoList = this._todoList.concat(todoItem);
        }
    }

    removeTodo(itemId: string) {
        if (itemId) {
            this._todoList = this._todoList.filter(item => {
                (item.identifier === itemId) ? false : true
            })
        }
    }
}

// implementing the VIEW

interface TodoListView {
    render(todoList: ReadonlyArray<TodoItem>) : void;
    getInput(): TodoItem;
    getFilter(): string;
    clearInput(): void;
    filter(): void;
}

class HTMLTodoListView implements TodoListView {
    private readonly todoInput: HTMLInputElement;
    private readonly todoListDiv: HTMLDivElement;
    private readonly todoListFilter: HTMLInputElement;

    constructor() {
        this.todoInput = document.getElementById('todoInput') as HTMLInputElement
        this.todoListDiv = document.getElementById('todoListContainer') as HTMLDivElement
        this.todoListFilter = document.getElementById('todoFilter') as HTMLInputElement;

        if(!this.todoInput) {
            throw new Error("Could not find the todoInput HTML element. Is the HTML correct");
        }

        if(!this.todoListDiv) {
            throw new Error("Could not find the todoListContainer HTML div. Is the HTML correct?");
        }
        if(!this.todoListFilter) {
            throw new Error("Could not find the todoFilter HTML input element. Is the HTML correct?");
        }
    }
    clearInput(): void {
        this.todoInput.value = ''
    }
    getFilter(): string {
        return this.todoListFilter.value.toUpperCase()
    }
    getInput(): TodoItem {
        const todoInputValue: string = this.todoInput.value.trim()
        const retVal: TodoItem = new TodoItem(todoInputValue)
        return retVal;
    }
    render(todoList: ReadonlyArray<TodoItem>): void {
        console.log("Updating the rendered todo list");
        this.todoListDiv.innerHTML = '';
        this.todoListDiv.textContent = '' //Edge

        const ul = document.createElement('ul')
        ul.setAttribute('id', 'todoList')
        this.todoListDiv.appendChild(ul)

        todoList.forEach(item => {
            const li = document.createElement('li')
            li.setAttribute('class', 'todo-list-item')
            li.innerHTML =  `<a href='#' onclick='todoIt.removeTodo("${item.identifier}")'> ${item.description}</a>`
            ul.appendChild(li)
        })

    }
    filter(): void {
        console.log("Filtering the rendered todo list");
        const todoListHtml: HTMLUListElement =
            document.getElementById('todoList') as HTMLUListElement
        if (todoListHtml == null) {
            console.log("Nothing to filter");
            return;
        }
        const todoListFilterText = this.getFilter();
        todoListHtml.childNodes.forEach((item) => {
            let itemText: string | null = item.textContent;
            if (itemText !== null) {
                itemText = itemText.toUpperCase();
                if (itemText.startsWith(todoListFilterText)) {
                    (item as HTMLLIElement).style.display = "listitem";
                } else {
                    (item as HTMLLIElement).style.display = "none";
                }
            }
        });
    }
}

// Controller Layer

interface TodoListController{
    addTodo():void;
    filterTodoList():void;
    removeTodo(identifier:string): void;
}

class TodoIt implements TodoListController {
    private readonly _todoList: TodoList = new TodoList();

    constructor(private _todoListView: TodoListView) {
        console.log("TodoIt")
        if (!_todoListView) {
            throw new Error("The todo list view implementation is required to properlu initialize TodoIt!");
        }
    }

    addTodo(): void {
        const newTodo = this._todoListView.getInput();

        if ('' !== newTodo.description){
            console.log("Adding todo: ", newTodo);

            this._todoList.addTodo(newTodo)
            console.log("New todo listL ", this._todoList.todoList);

            this._todoListView.clearInput()

            this._todoListView.render(this._todoList.todoList)

            this.filterTodoList()
        }
    }

    filterTodoList() : void {
        this._todoListView.filter()
    }

    removeTodo(identifier: string): void {
        if (identifier) {
            console.log("item to remove: ", identifier)
            this._todoList.removeTodo(identifier)
            this._todoListView.render(this._todoList.todoList)
            this.filterTodoList()
        }
    }
}

class EventUtils {
    static isEnter(event: KeyboardEvent): boolean {
        let isEnterResult = false

        if(event !== undefined && event.defaultPrevented) {
            return false
        }

        if (event == undefined) {
            isEnterResult = false
        } else if (event.key !== undefined) {
            isEnterResult = event.key === 'Enter';
        } else if (event.keyCode !== undefined){
            isEnterResult = event.keyCode === 13;
        }

        return isEnterResult;
    }
}

const view = new HTMLTodoListView()
const todoIt = new TodoIt(view)