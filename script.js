class ChatDOMService {
    constructor() {
        this.LOCAL_STORAGE_KEY = "__data"

        this.container = document.getElementById("chat-container");
        this.__data = [{ id: "1", text: "Hey There", parentId: null }];

        if (localStorage.getItem(this.LOCAL_STORAGE_KEY)) {
            this.__data = [...JSON.parse(localStorage.getItem(this.LOCAL_STORAGE_KEY))]
        }

        this.renderDOM()
    }

    /**
     *
     * @param {*} id
     */
    getParentById(id) {
        return this.__data.find((e) => e.id === id);
    }

    /**
     *
     * @param {string | null} id
     * @returns
     */
    getCommentsByParentId(id = null) {
        return this.__data.filter((e) => e.parentId === id);
    }

    /**
     *
     * @param {string | null} parentId
     */
    handleAddReply(parentId = null) {
        const parent = this.getParentById(parentId);
        const reply = prompt(`Replying to ${parent.text}`);
        this.__data.push({ id: Date.now().toString(), text: reply, parentId });

        localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(this.__data))

        this.renderDOM();
    }

    /**
     * 
     * @param {string} id 
     */
    handleDeleteComment(id) {
        const children = this.getCommentsByParentId(id);
        for (const child of children)
            this.handleDeleteComment(child.id);
        this.__data = this.__data.filter(e => e.id !== id);
        localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(this.__data))
        this.renderDOM()
    }

    /**
     *
     * @param {DocumentFragment | null} fragment
     * @param {string | null} parentId
     */
    generateDataTree(fragment = null, parentId = null) {
        if (!fragment) fragment = document.createDocumentFragment();

        const nodes = this.getCommentsByParentId(parentId);

        for (const node of nodes) {
            const parentNode = document.createElement("div");

            if (parentId) {
                const styleNode = document.createElement("div");
                parentNode.style.position = "relative";

                parentNode.style.marginLeft = `20px`;
                parentNode.style.paddingLeft = `20px`;

                styleNode.classList.add("child-reply");
                parentNode.appendChild(styleNode);
            }

            const addReplyButton = document.createElement("button");
            addReplyButton.innerText = "Reply";

            const deleteButton = document.createElement("button");
            deleteButton.innerText = "Delete";

            addReplyButton.addEventListener("click", (e) => {
                this.handleAddReply(node.id);
            });

            deleteButton.addEventListener("click", (e) => {
                this.handleDeleteComment(node.id);
            });



            const container = document.createElement("div");
            container.classList.add("message-container");
            const titleNode = document.createElement("p");

            const textNode = document.createTextNode(node.text);
            titleNode.appendChild(textNode);

            container.appendChild(titleNode);
            container.appendChild(addReplyButton);
            container.appendChild(deleteButton);

            parentNode.appendChild(container);

            const childFragment = document.createDocumentFragment();
            parentNode.appendChild(this.generateDataTree(childFragment, node.id));
            fragment.appendChild(parentNode);
        }

        return fragment;
    }

    renderDOM() {
        const renderedDOMFragment = this.generateDataTree();
        this.container.innerHTML = "";
        this.container.appendChild(renderedDOMFragment);
    }
}

const service = new ChatDOMService();
