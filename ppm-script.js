// PPM (Project Portfolio Management) System
// Trello-like Kanban board for workflow execution

const PPM = (() => {
    // ===== STATE =====
    let state = {
        view: 'boards', // 'boards' or 'board'
        currentBoardId: null,
        currentUser: null,
        boards: [],
        users: [],
        theme: 'light',
        draggedCard: null,
        draggedOverColumn: null,
        backlogFilter: null, // Filter cards by backlog item ID
        categoryFilter: null // Filter cards by category ID
    };

    // ===== UTILITIES =====
    const generateId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    
    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const getRelativeTime = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = date - now;
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
        if (diffDays === 0) return 'Due today';
        if (diffDays === 1) return 'Due tomorrow';
        return `Due in ${diffDays} days`;
    };

    const getUserById = (userId) => {
        return state.users.find(u => u.id === userId) || null;
    };

    const getCurrentBoard = () => {
        return state.boards.find(b => b.id === state.currentBoardId) || null;
    };

    const getColumnById = (board, columnId) => {
        return board.columns.find(c => c.id === columnId) || null;
    };

    const getCardById = (board, cardId) => {
        return board.cards.find(c => c.id === cardId) || null;
    };

    const getCardsByColumn = (board, columnId) => {
        let cards = board.cards.filter(c => c.columnId === columnId);
        
        // Apply backlog filter if active
        if (state.backlogFilter) {
            cards = cards.filter(c => {
                const isTheBacklogItem = c.id === state.backlogFilter;
                const isLinkedToBacklog = c.linkedBacklogItems && c.linkedBacklogItems.includes(state.backlogFilter);
                return isTheBacklogItem || isLinkedToBacklog;
            });
        }
        
        return cards.sort((a, b) => a.order - b.order);
    };

    // ===== DATA LAYER =====
    const loadBoards = async () => {
        try {
            const res = await fetch(`data/ppm-boards.json?t=${Date.now()}`);
            if (!res.ok) throw new Error('Failed to load boards');
            const data = await res.json();
            state.boards = data.boards || [];
        } catch (e) {
            console.error('Load boards error:', e);
            alert('Failed to load boards. Please refresh the page.');
            state.boards = [];
        }
    };

    const loadUsers = async () => {
        try {
            const res = await fetch(`data/ppm-users.json?t=${Date.now()}`);
            if (!res.ok) throw new Error('Failed to load users');
            const data = await res.json();
            state.users = data.users || [];
            // Set current user to first user (in real app, would be from auth)
            state.currentUser = state.users[0] || null;
        } catch (e) {
            console.error('Load users error:', e);
            alert('Failed to load users. Please refresh the page.');
            state.users = [];
        }
    };

    const saveBoards = async () => {
        try {
            const res = await fetch('save_board.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ boards: state.boards })
            });
            const json = await res.json();
            if (!res.ok || json.status !== 'success') throw new Error(json.message || 'Save failed');
            return true;
        } catch (e) {
            console.error('Save boards error:', e);
            alert('Failed to save boards: ' + e.message);
            return false;
        }
    };

    const saveUsers = async () => {
        try {
            const res = await fetch('save_users.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ users: state.users })
            });
            const json = await res.json();
            if (!res.ok || json.status !== 'success') throw new Error(json.message || 'Save failed');
            return true;
        } catch (e) {
            console.error('Save users error:', e);
            return false;
        }
    };

    // ===== BOARD OPERATIONS =====
    const createBoard = (name, description, sourceData = null, options = {}) => {
        const board = {
            id: generateId('board'),
            name: name || 'New Board',
            description: description || '',
            sourceControlId: sourceData?.controlId || null,
            sourceFlowId: sourceData?.flowId || null,
            createdAt: new Date().toISOString(),
            createdBy: state.currentUser?.id || 'user-default-001',
            archived: false,
            members: [
                {
                    userId: state.currentUser?.id || 'user-default-001',
                    name: state.currentUser?.name || 'Default User',
                    email: state.currentUser?.email || 'user@company.com',
                    role: 'admin',
                    avatar: state.currentUser?.avatar || '',
                    joinedAt: new Date().toISOString()
                }
            ],
            columns: createDefaultColumns(options.includeReferences !== false), // true by default
            cards: [],
            labels: [],
            milestones: [], // NEW
            categories: [], // NEW
            groups: [],     // NEW
            settings: {
                notificationsEnabled: true,
                allowGuestView: false,
                enforceWIPLimit: false
            },
            activity: []
        };

        state.boards.push(board);
        logActivity(board, null, 'board.created', { boardName: board.name });
        return board;
    };

    const createDefaultColumns = (includeReferences = true) => {
        const columns = [];
        
        // References column (locked, optional)
        if (includeReferences) {
            columns.push({ 
                id: generateId('col'), 
                name: 'References', 
                order: 0, 
                limit: null, 
                color: '#6c757d',
                locked: true  // Cards in this column cannot be moved
            });
        }
        
        // Standard workflow columns
        const startOrder = includeReferences ? 1 : 0;
        columns.push(
            { id: generateId('col'), name: 'To Do', order: startOrder, limit: null, color: '#0d6efd' },
            { id: generateId('col'), name: 'In Progress', order: startOrder + 1, limit: 5, color: '#0dcaf0' },
            { id: generateId('col'), name: 'Review', order: startOrder + 2, limit: null, color: '#ffc107' },
            { id: generateId('col'), name: 'Done', order: startOrder + 3, limit: null, color: '#198754' }
        );
        
        return columns;
    };

    const addColumn = (board, name) => {
        const maxOrder = board.columns.reduce((max, col) => Math.max(max, col.order), -1);
        const column = {
            id: generateId('col'),
            name: name || 'New Column',
            order: maxOrder + 1,
            limit: null,
            color: '#6c757d'
        };
        board.columns.push(column);
        logActivity(board, null, 'column.created', { columnName: column.name });
        return column;
    };

    const updateColumn = (board, columnId, updates) => {
        const column = getColumnById(board, columnId);
        if (column) {
            Object.assign(column, updates);
            logActivity(board, null, 'column.updated', { columnName: column.name });
        }
    };

    const deleteColumn = (board, columnId) => {
        const column = getColumnById(board, columnId);
        if (!column) return;
        
        // Move cards to first column
        const firstColumn = board.columns.find(c => c.id !== columnId);
        if (firstColumn) {
            board.cards.forEach(card => {
                if (card.columnId === columnId) {
                    card.columnId = firstColumn.id;
                }
            });
        }
        
        board.columns = board.columns.filter(c => c.id !== columnId);
        logActivity(board, null, 'column.deleted', { columnName: column.name });
    };

    // ===== MILESTONE OPERATIONS =====
    const createMilestone = (board, data) => {
        const milestone = {
            id: generateId('milestone'),
            name: data.name || 'New Milestone',
            description: data.description || '',
            linkedCards: data.linkedCards || [],
            status: 'in_progress',
            color: data.color || '#4a6cf7',
            createdAt: new Date().toISOString()
        };
        
        board.milestones.push(milestone);
        logActivity(board, null, 'milestone.created', { milestoneName: milestone.name });
        return milestone;
    };

    const updateMilestone = (board, milestoneId, data) => {
        const milestone = board.milestones.find(m => m.id === milestoneId);
        if (!milestone) return null;
        
        if (data.name !== undefined) milestone.name = data.name;
        if (data.description !== undefined) milestone.description = data.description;
        if (data.linkedCards !== undefined) milestone.linkedCards = data.linkedCards;
        if (data.color !== undefined) milestone.color = data.color;
        
        // Auto-update status based on linked cards
        updateMilestoneStatus(board, milestoneId);
        
        logActivity(board, null, 'milestone.updated', { milestoneName: milestone.name });
        return milestone;
    };

    const deleteMilestone = (board, milestoneId) => {
        const index = board.milestones.findIndex(m => m.id === milestoneId);
        if (index === -1) return false;
        
        const milestone = board.milestones[index];
        
        // Remove milestone reference from all cards
        board.cards.forEach(card => {
            if (card.milestoneId === milestoneId) {
                delete card.milestoneId;
            }
        });
        
        board.milestones.splice(index, 1);
        logActivity(board, null, 'milestone.deleted', { milestoneName: milestone.name });
        return true;
    };

    const updateMilestoneStatus = (board, milestoneId) => {
        const milestone = board.milestones.find(m => m.id === milestoneId);
        if (!milestone || milestone.linkedCards.length === 0) return;
        
        // Check if all linked cards are in "Done" column
        const doneColumn = board.columns.find(c => c.name === 'Done');
        if (!doneColumn) return;
        
        const allDone = milestone.linkedCards.every(cardId => {
            const card = board.cards.find(c => c.id === cardId);
            return card && card.columnId === doneColumn.id;
        });
        
        const oldStatus = milestone.status;
        milestone.status = allDone ? 'completed' : 'in_progress';
        
        if (oldStatus !== milestone.status && milestone.status === 'completed') {
            logActivity(board, null, 'milestone.completed', { milestoneName: milestone.name });
        }
    };

    const getMilestoneById = (board, milestoneId) => {
        return board.milestones.find(m => m.id === milestoneId);
    };

    // ===== CATEGORY OPERATIONS =====
    const createCategory = (board, data) => {
        const category = {
            id: generateId('category'),
            name: data.name || 'New Category',
            color: data.color || '#28a745',
            icon: data.icon || 'fa-tag',
            createdAt: new Date().toISOString()
        };
        
        board.categories.push(category);
        logActivity(board, null, 'category.created', { categoryName: category.name });
        return category;
    };

    const updateCategory = (board, categoryId, data) => {
        const category = board.categories.find(c => c.id === categoryId);
        if (!category) return null;
        
        if (data.name !== undefined) category.name = data.name;
        if (data.color !== undefined) category.color = data.color;
        if (data.icon !== undefined) category.icon = data.icon;
        
        logActivity(board, null, 'category.updated', { categoryName: category.name });
        return category;
    };

    const deleteCategory = (board, categoryId) => {
        const index = board.categories.findIndex(c => c.id === categoryId);
        if (index === -1) return false;
        
        const category = board.categories[index];
        
        // Remove category reference from all cards
        board.cards.forEach(card => {
            if (card.categoryId === categoryId) {
                delete card.categoryId;
            }
        });
        
        board.categories.splice(index, 1);
        logActivity(board, null, 'category.deleted', { categoryName: category.name });
        return true;
    };

    const getCategoryById = (board, categoryId) => {
        return board.categories.find(c => c.id === categoryId);
    };

    // ===== GROUP OPERATIONS =====
    const createGroup = (board, data) => {
        const group = {
            id: generateId('group'),
            name: data.name || 'New Group',
            linkedCards: data.linkedCards || [],
            color: data.color || '#ffc107',
            createdAt: new Date().toISOString()
        };
        
        board.groups.push(group);
        logActivity(board, null, 'group.created', { groupName: group.name });
        return group;
    };

    const updateGroup = (board, groupId, data) => {
        const group = board.groups.find(g => g.id === groupId);
        if (!group) return null;
        
        if (data.name !== undefined) group.name = data.name;
        if (data.linkedCards !== undefined) group.linkedCards = data.linkedCards;
        if (data.color !== undefined) group.color = data.color;
        
        logActivity(board, null, 'group.updated', { groupName: group.name });
        return group;
    };

    const deleteGroup = (board, groupId) => {
        const index = board.groups.findIndex(g => g.id === groupId);
        if (index === -1) return false;
        
        const group = board.groups[index];
        
        // Remove group reference from all cards
        board.cards.forEach(card => {
            if (card.groupIds && card.groupIds.includes(groupId)) {
                card.groupIds = card.groupIds.filter(id => id !== groupId);
            }
        });
        
        board.groups.splice(index, 1);
        logActivity(board, null, 'group.deleted', { groupName: group.name });
        return true;
    };

    const getGroupById = (board, groupId) => {
        return board.groups.find(g => g.id === groupId);
    };

    // ===== CARD OPERATIONS =====
    const createCard = (board, columnId, cardData) => {
        const cardsInColumn = getCardsByColumn(board, columnId);
        const maxOrder = cardsInColumn.reduce((max, card) => Math.max(max, card.order), -1);
        
        const card = {
            id: generateId('card'),
            boardId: board.id,
            columnId: columnId,
            order: maxOrder + 1,
            title: cardData.title || 'New Task',
            description: cardData.description || '',
            sourceType: cardData.sourceType || null, // 'control', 'action', or 'evidence'
            sourceId: cardData.sourceId || null,
            sourceGrade: cardData.sourceGrade || null,
            assignments: [],
            schedule: {
                startDate: null,
                startMode: 'date',
                startDays: null,
                startDependency: null,
                dueDate: null,
                dueMode: 'date',
                dueDays: null,
                recurrence: {
                    enabled: false,
                    pattern: 'monthly',
                    interval: 1,
                    startOf: 'month',
                    endOf: null,
                    customDays: [],
                    endMode: 'never',
                    endOccurrences: null,
                    endDate: null
                },
                reminders: []
            },
            checklist: cardData.checklist || [],
            labels: cardData.labels || [],
            attachments: cardData.attachments || [],
            linkedBacklogItems: cardData.linkedBacklogItems || [], // IDs of backlog cards this task is linked to
            milestoneId: cardData.milestoneId || null,  // NEW: Link to milestone
            categoryId: cardData.categoryId || null,    // NEW: Link to category  
            groupIds: cardData.groupIds || [],          // NEW: Link to multiple groups
            status: {
                current: 'pending',
                blocked: false,
                blockedReason: null,
                approvalStatus: null,
                approvedBy: null,
                approvedAt: null
            },
            effort: {
                estimated: null,
                actual: null,
                unit: 'hours'
            },
            activity: [],
            createdAt: new Date().toISOString(),
            createdBy: state.currentUser?.id || 'user-default-001',
            updatedAt: new Date().toISOString(),
            updatedBy: state.currentUser?.id || 'user-default-001'
        };

        board.cards.push(card);
        logActivity(board, card.id, 'card.created', { cardTitle: card.title });
        return card;
    };

    const updateCard = (board, cardId, updates) => {
        const card = getCardById(board, cardId);
        if (!card) return;
        
        Object.assign(card, updates);
        card.updatedAt = new Date().toISOString();
        card.updatedBy = state.currentUser?.id || 'user-default-001';
        
        logActivity(board, card.id, 'card.updated', { cardTitle: card.title });
    };

    const moveCard = (board, cardId, toColumnId, toOrder = -1) => {
        const card = getCardById(board, cardId);
        if (!card) return;
        
        const fromColumn = getColumnById(board, card.columnId);
        const toColumn = getColumnById(board, toColumnId);
        
        if (!toColumn) return;
        
        // Remove from old position
        const oldColumnId = card.columnId;
        
        // Update card
        card.columnId = toColumnId;
        
        // Reorder cards in new column
        const cardsInNewColumn = getCardsByColumn(board, toColumnId)
            .filter(c => c.id !== cardId);
        
        if (toOrder === -1 || toOrder >= cardsInNewColumn.length) {
            // Add to end
            card.order = cardsInNewColumn.length;
        } else {
            // Insert at position
            card.order = toOrder;
            cardsInNewColumn.forEach((c, i) => {
                if (i >= toOrder) c.order = i + 1;
            });
        }
        
        // Reorder remaining cards in old column
        if (oldColumnId !== toColumnId) {
            const cardsInOldColumn = getCardsByColumn(board, oldColumnId);
            cardsInOldColumn.forEach((c, i) => {
                c.order = i;
            });
        }
        
        logActivity(board, card.id, 'card.moved', {
            cardTitle: card.title,
            from: fromColumn?.name,
            to: toColumn?.name
        });
    };

    const deleteCard = (board, cardId) => {
        const card = getCardById(board, cardId);
        if (!card) return;
        
        board.cards = board.cards.filter(c => c.id !== cardId);
        
        // Reorder remaining cards in column
        const cardsInColumn = getCardsByColumn(board, card.columnId);
        cardsInColumn.forEach((c, i) => {
            c.order = i;
        });
        
        logActivity(board, null, 'card.deleted', { cardTitle: card.title });
    };

    // ===== ASSIGNMENT OPERATIONS =====
    const assignUser = (board, cardId, userId, role) => {
        const card = getCardById(board, cardId);
        const user = getUserById(userId);
        if (!card || !user) return;
        
        // Check if already assigned
        const existing = card.assignments.find(a => a.userId === userId && a.role === role);
        if (existing) return;
        
        card.assignments.push({
            userId: userId,
            role: role, // 'executor', 'follower', 'approver', 'supervisor'
            assignedAt: new Date().toISOString(),
            assignedBy: state.currentUser?.id || 'user-default-001'
        });
        
        logActivity(board, card.id, 'card.assigned', {
            cardTitle: card.title,
            assignedUser: user.name,
            role: role
        });
    };

    const unassignUser = (board, cardId, userId, role) => {
        const card = getCardById(board, cardId);
        if (!card) return;
        
        card.assignments = card.assignments.filter(a => 
            !(a.userId === userId && a.role === role)
        );
        
        logActivity(board, card.id, 'card.unassigned', {
            cardTitle: card.title,
            userId: userId,
            role: role
        });
    };

    // ===== ACTIVITY LOG =====
    const logActivity = (board, cardId, type, data) => {
        const activity = {
            id: generateId('act'),
            boardId: board.id,
            cardId: cardId,
            userId: state.currentUser?.id || 'user-default-001',
            type: type,
            timestamp: new Date().toISOString(),
            data: data,
            description: generateActivityDescription(type, data)
        };
        
        board.activity.unshift(activity);
        
        // Keep only last 100 activities
        if (board.activity.length > 100) {
            board.activity = board.activity.slice(0, 100);
        }
    };

    const generateActivityDescription = (type, data) => {
        const userName = state.currentUser?.name || 'User';
        switch (type) {
            case 'board.created': return `${userName} created board "${data.boardName}"`;
            case 'column.created': return `${userName} added column "${data.columnName}"`;
            case 'column.updated': return `${userName} updated column "${data.columnName}"`;
            case 'column.deleted': return `${userName} deleted column "${data.columnName}"`;
            case 'card.created': return `${userName} created card "${data.cardTitle}"`;
            case 'card.updated': return `${userName} updated card "${data.cardTitle}"`;
            case 'card.moved': return `${userName} moved "${data.cardTitle}" from ${data.from} to ${data.to}`;
            case 'card.deleted': return `${userName} deleted card "${data.cardTitle}"`;
            case 'card.assigned': return `${userName} assigned ${data.assignedUser} as ${data.role} to "${data.cardTitle}"`;
            case 'card.unassigned': return `${userName} removed assignment from "${data.cardTitle}"`;
            default: return `${userName} performed action: ${type}`;
        }
    };

    // ===== WORKFLOW INTEGRATION =====
    const convertControlToBoard = (control, flowId) => {
        const board = createBoard(
            control.name,
            control.text || '',
            { controlId: control.id, flowId: flowId }
        );
        
        // Convert tags to labels
        if (control.tags && control.tags.length > 0) {
            control.tags.forEach(tag => {
                board.labels.push({
                    id: generateId('label'),
                    boardId: board.id,
                    name: tag,
                    color: getRandomLabelColor(),
                    description: ''
                });
            });
        }
        
        // Convert Actions and Evidence to cards
        const backlogColumn = board.columns[0]; // Backlog column
        
        (control.subcategories || []).forEach(action => {
            // Create a card for each evidence
            (action.subcategories || []).forEach(evidence => {
                const cardData = {
                    title: evidence.name,
                    description: evidence.text || '',
                    sourceType: 'evidence',
                    sourceId: evidence.id,
                    sourceGrade: evidence.grade,
                    labels: [...(action.tags || []), ...(evidence.tags || [])],
                    checklist: [],
                    attachments: convertFooterToAttachments(evidence.footer)
                };
                
                createCard(board, backlogColumn.id, cardData);
            });
        });
        
        return board;
    };

    const convertFooterToAttachments = (footer) => {
        if (!footer) return [];
        const attachments = [];
        
        (footer.links || []).forEach(link => {
            attachments.push({
                id: generateId('att'),
                type: 'link',
                title: link.text,
                url: link.url,
                content: null,
                uploadedBy: state.currentUser?.id || 'user-default-001',
                uploadedAt: new Date().toISOString()
            });
        });
        
        (footer.images || []).forEach(img => {
            attachments.push({
                id: generateId('att'),
                type: 'image',
                title: 'Image',
                url: img,
                content: null,
                uploadedBy: state.currentUser?.id || 'user-default-001',
                uploadedAt: new Date().toISOString()
            });
        });
        
        (footer.notes || []).forEach(note => {
            attachments.push({
                id: generateId('att'),
                type: 'note',
                title: note.title,
                url: null,
                content: note.content,
                uploadedBy: state.currentUser?.id || 'user-default-001',
                uploadedAt: new Date().toISOString()
            });
        });
        
        (footer.comments || []).forEach(comment => {
            attachments.push({
                id: generateId('att'),
                type: 'comment',
                title: 'Comment',
                url: null,
                content: comment,
                uploadedBy: state.currentUser?.id || 'user-default-001',
                uploadedAt: new Date().toISOString()
            });
        });
        
        return attachments;
    };

    const getRandomLabelColor = () => {
        const colors = ['#dc3545', '#0d6efd', '#198754', '#ffc107', '#0dcaf0', '#6c757d'];
        return colors[Math.floor(Math.random() * colors.length)];
    };

    // ===== UI RENDERING =====
    const renderBoardsView = () => {
        const grid = document.getElementById('boards-grid');
        const emptyState = document.getElementById('empty-state');
        
        if (!state.boards || state.boards.length === 0) {
            grid.classList.add('hidden');
            emptyState.classList.remove('hidden');
            return;
        }
        
        const activeBoards = state.boards.filter(b => !b.archived);
        
        if (activeBoards.length === 0) {
            grid.classList.add('hidden');
            if (emptyState) emptyState.classList.remove('hidden');
            return;
        }
        
        grid.classList.remove('hidden');
        if (emptyState) emptyState.classList.add('hidden');
        
        grid.innerHTML = activeBoards
            .map(board => renderBoardCard(board))
            .join('');
        
        // Add click handlers
        grid.querySelectorAll('.board-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.board-card-menu')) {
                    const boardId = card.dataset.boardId;
                    window.location.href = `board.html?id=${boardId}`;
                }
            });
        });
    };

    const renderBoardCard = (board) => {
        const cardCount = board.cards.length;
        const doneColumn = board.columns.find(c => c.name === 'Done');
        const doneCount = doneColumn ? board.cards.filter(c => c.columnId === doneColumn.id).length : 0;
        const progress = cardCount > 0 ? Math.round((doneCount / cardCount) * 100) : 0;
        
        return `
            <div class="board-card" data-board-id="${board.id}">
                <div class="board-card-header">
                    <h3 class="board-card-title">${board.name}</h3>
                    <button class="board-card-menu" onclick="PPM.ui.openBoardMenu(event, '${board.id}')">
                        <i class="fa-solid fa-ellipsis-h"></i>
                    </button>
                </div>
                <p class="board-card-description">${board.description || 'No description'}</p>
                <div class="board-card-stats">
                    <div class="stat">
                        <i class="fa-solid fa-clipboard-check"></i>
                        <span>${cardCount} tasks</span>
                    </div>
                    <div class="stat">
                        <i class="fa-solid fa-users"></i>
                        <span>${board.members.length} members</span>
                    </div>
                </div>
                <div class="board-card-progress">
                    <div class="progress-bar-container">
                        <div class="progress-bar" style="width: ${progress}%;"></div>
                    </div>
                    <span class="progress-text">${progress}% complete</span>
                </div>
            </div>
        `;
    };

    const renderBoardView = () => {
        const board = getCurrentBoard();
        if (!board) {
            window.location.href = 'boards.html';
            return;
        }
        
        // Update title
        document.getElementById('board-title').textContent = board.name;
        
        // Render members
        renderBoardMembers(board);
        
        // Render management items
        renderMilestones(board);
        renderCategories(board);
        renderGroups(board);
        
        // Render columns
        renderColumns(board);
        
        // Update backlog filter banner
        updateBacklogFilterBanner();
    };

    const renderMilestones = (board) => {
        const container = document.getElementById('milestones-container');
        if (!container) return;
        
        if (!board.milestones || board.milestones.length === 0) {
            container.innerHTML = '<span class="empty-message">No milestones yet</span>';
            return;
        }
        
        container.innerHTML = board.milestones.map(milestone => {
            const linkedCount = milestone.linkedCards.length;
            const doneCount = milestone.linkedCards.filter(cardId => {
                const card = board.cards.find(c => c.id === cardId);
                const doneColumn = board.columns.find(col => col.name === 'Done');
                return card && doneColumn && card.columnId === doneColumn.id;
            }).length;
            
            const isCompleted = milestone.status === 'completed';
            const progress = linkedCount > 0 ? `${doneCount}/${linkedCount}` : '0/0';
            
            return `
                <div class="milestone-item ${isCompleted ? 'completed' : ''}" 
                     style="border-color: ${milestone.color}; ${!isCompleted ? `background-color: ${milestone.color}15;` : ''}"
                     onclick="PPM.ui.showMilestoneDetails('${milestone.id}')"
                     title="${milestone.description || milestone.name}">
                    <div class="milestone-color" style="background-color: ${milestone.color}"></div>
                    <span class="milestone-name">${milestone.name}</span>
                    <span class="milestone-progress">${progress}</span>
                    <div class="milestone-actions" onclick="event.stopPropagation()">
                        <button class="btn-milestone-action" onclick="PPM.ui.showEditMilestoneDialog('${milestone.id}')" title="Edit">
                            <i class="fa-solid fa-pen"></i>
                        </button>
                        <button class="btn-milestone-action" onclick="PPM.ui.deleteMilestoneConfirm('${milestone.id}')" title="Delete">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    };

    const renderCategories = (board) => {
        const container = document.getElementById('categories-container');
        if (!container) return;
        
        if (!board.categories || board.categories.length === 0) {
            container.innerHTML = '<span class="empty-message">No categories yet</span>';
            return;
        }
        
        container.innerHTML = board.categories.map(category => {
            const cardCount = board.cards.filter(c => c.categoryId === category.id).length;
            const isActive = state.categoryFilter === category.id;
            
            return `
                <div class="category-item ${isActive ? 'active' : ''}" 
                     onclick="PPM.ui.toggleCategoryFilter('${category.id}')"
                     title="Click to filter by ${category.name}">
                    <div class="category-color" style="background-color: ${category.color}"></div>
                    <span class="category-name">${category.name}</span>
                    <span class="category-count">${cardCount}</span>
                    <div class="category-actions" onclick="event.stopPropagation()">
                        <button class="btn-milestone-action" onclick="PPM.ui.showEditCategoryDialog('${category.id}')" title="Edit">
                            <i class="fa-solid fa-pen"></i>
                        </button>
                        <button class="btn-milestone-action" onclick="PPM.ui.deleteCategoryConfirm('${category.id}')" title="Delete">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    };

    const renderGroups = (board) => {
        const container = document.getElementById('groups-container');
        if (!container) return;
        
        if (!board.groups || board.groups.length === 0) {
            container.innerHTML = '<span class="empty-message">No groups yet</span>';
            return;
        }
        
        container.innerHTML = board.groups.map(group => {
            const cardCount = group.linkedCards.length;
            
            return `
                <div class="group-item" 
                     onclick="PPM.ui.showGroupDetails('${group.id}')"
                     title="Click to manage group">
                    <div class="group-color" style="background-color: ${group.color}"></div>
                    <span class="group-name">${group.name}</span>
                    <span class="group-count">${cardCount} cards</span>
                    <div class="group-actions" onclick="event.stopPropagation()">
                        <button class="btn-milestone-action" onclick="PPM.ui.showEditGroupDialog('${group.id}')" title="Edit">
                            <i class="fa-solid fa-pen"></i>
                        </button>
                        <button class="btn-milestone-action" onclick="PPM.ui.showGroupBulkActions('${group.id}')" title="Bulk Actions">
                            <i class="fa-solid fa-bolt"></i>
                        </button>
                        <button class="btn-milestone-action" onclick="PPM.ui.deleteGroupConfirm('${group.id}')" title="Delete">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    };

    const renderBoardMembers = (board) => {
        const container = document.getElementById('board-members');
        container.innerHTML = board.members.slice(0, 5).map(member => {
            const initials = member.name.split(' ').map(n => n[0]).join('').toUpperCase();
            return `
                <div class="member-avatar" title="${member.name}">
                    ${member.avatar ? `<img src="${member.avatar}" alt="${member.name}">` : `<span>${initials}</span>`}
                </div>
            `;
        }).join('');
        
        if (board.members.length > 5) {
            container.innerHTML += `<div class="member-avatar"><span>+${board.members.length - 5}</span></div>`;
        }
    };

    const renderColumns = (board) => {
        const container = document.getElementById('board-columns');
        container.innerHTML = board.columns
            .sort((a, b) => a.order - b.order)
            .map(column => renderColumn(board, column))
            .join('');
        
        // Setup drag and drop
        setupDragAndDrop();
    };

    const renderColumn = (board, column) => {
        const cards = getCardsByColumn(board, column.id);
        const limit = column.limit;
        const isOverLimit = limit && cards.length > limit;
        const lockedClass = column.locked ? ' board-column-locked' : '';
        const lockIcon = column.locked ? '<i class="fa-solid fa-lock" title="Locked column"></i> ' : '';
        
        return `
            <div class="board-column${lockedClass}" data-column-id="${column.id}">
                <div class="column-header">
                    <h3 class="column-title">${lockIcon}${column.name}</h3>
                    <span class="column-count ${isOverLimit ? 'over-limit' : ''}">${cards.length}${limit ? `/${limit}` : ''}</span>
                    <button class="btn-icon" onclick="PPM.ui.openColumnMenu(event, '${column.id}')">
                        <i class="fa-solid fa-ellipsis-h"></i>
                    </button>
                </div>
                <div class="column-cards" data-column-id="${column.id}">
                    ${cards.map(card => renderCard(board, card)).join('')}
                </div>
            </div>
        `;
    };

    const renderCard = (board, card) => {
        const assignees = card.assignments.filter(a => a.role === 'executor');
        const hasApprover = card.assignments.some(a => a.role === 'approver');
        const dueDate = card.schedule.dueDate;
        const isOverdue = dueDate && new Date(dueDate) < new Date();
        const isDueSoon = dueDate && !isOverdue && new Date(dueDate) - new Date() < 3 * 24 * 60 * 60 * 1000;
        
        let dueDateClass = '';
        if (isOverdue) dueDateClass = 'overdue';
        else if (isDueSoon) dueDateClass = 'due-soon';
        
        // Get the References column ID (first column)
        const referencesColumnId = board.columns[0]?.id;
        const isReferenceCard = card.columnId === referencesColumnId;
        
        // Check if card is in Done column
        const doneColumn = board.columns.find(col => col.name === 'Done');
        const isDone = doneColumn && card.columnId === doneColumn.id;
        
        return `
            <div class="card ${isReferenceCard ? 'backlog-card' : ''} ${isDone ? 'card-done' : ''}" 
                 draggable="true" 
                 data-card-id="${card.id}"
                 onclick="PPM.ui.openCardDetail('${card.id}')">
                ${isReferenceCard ? `
                    <div class="backlog-card-actions">
                        <button class="backlog-action-btn" 
                                onclick="event.stopPropagation(); PPM.ui.filterByBacklog('${card.id}')" 
                                title="Filter board by this item">
                            <i class="fa-solid fa-filter"></i>
                        </button>
                        <button class="backlog-action-btn" 
                                onclick="event.stopPropagation(); PPM.ui.openCardDetail('${card.id}')" 
                                title="View details">
                            <i class="fa-solid fa-info-circle"></i>
                        </button>
                    </div>
                ` : ''}
                ${card.labels.length > 0 ? `
                    <div class="card-labels">
                        ${card.labels.slice(0, 3).map(label => `<span class="card-label">${label}</span>`).join('')}
                    </div>
                ` : ''}
                <h4 class="card-title">
                    ${isDone ? '<i class="fa-solid fa-circle-check done-icon"></i> ' : ''}
                    ${card.title}
                </h4>
                ${card.description ? `<p class="card-description">${card.description.substring(0, 100)}${card.description.length > 100 ? '...' : ''}</p>` : ''}
                
                ${isReferenceCard && card.attachments.length > 0 ? `
                    <div class="backlog-attachments">
                        ${card.attachments.slice(0, 5).map((att, idx) => `
                            <button class="attachment-preview-btn" 
                                    onclick="event.stopPropagation(); PPM.ui.openAttachment('${card.id}', ${idx})"
                                    title="${att.title}">
                                <i class="fa-solid fa-${att.type === 'link' ? 'link' : att.type === 'image' ? 'image' : att.type === 'note' ? 'book-open' : 'comment'}"></i>
                            </button>
                        `).join('')}
                        ${card.attachments.length > 5 ? `<span class="attachment-more">+${card.attachments.length - 5}</span>` : ''}
                    </div>
                ` : ''}
                
                <div class="card-meta">
                    ${dueDate ? `<span class="card-due ${dueDateClass}"><i class="fa-solid fa-clock"></i> ${formatDate(dueDate)}</span>` : ''}
                    ${card.checklist.length > 0 ? `<span class="card-checklist"><i class="fa-solid fa-check-square"></i> ${card.checklist.filter(c => c.completed).length}/${card.checklist.length}</span>` : ''}
                    ${!isReferenceCard && card.attachments.length > 0 ? `<span class="card-attachments"><i class="fa-solid fa-paperclip"></i> ${card.attachments.length}</span>` : ''}
                    ${hasApprover ? `<span class="card-approval"><i class="fa-solid fa-user-check"></i></span>` : ''}
                </div>
                ${assignees.length > 0 ? `
                    <div class="card-assignees">
                        ${assignees.slice(0, 3).map(a => {
                            const user = getUserById(a.userId);
                            const initials = user ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : '?';
                            return `<div class="assignee-avatar" title="${user?.name || 'Unknown'}">${initials}</div>`;
                        }).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    };

    // ===== DRAG AND DROP =====
    const setupDragAndDrop = () => {
        const cards = document.querySelectorAll('.card');
        const columns = document.querySelectorAll('.column-cards');
        
        cards.forEach(card => {
            card.addEventListener('dragstart', handleDragStart);
            card.addEventListener('dragend', handleDragEnd);
        });
        
        columns.forEach(column => {
            column.addEventListener('dragover', handleDragOver);
            column.addEventListener('drop', handleDrop);
            column.addEventListener('dragleave', handleDragLeave);
        });
    };

    const handleDragStart = (e) => {
        const board = getCurrentBoard();
        const cardId = e.target.dataset.cardId;
        const card = board.cards.find(c => c.id === cardId);
        
        if (!card) return;
        
        // Check if card is in a locked column
        const column = board.columns.find(col => col.id === card.columnId);
        if (column && column.locked) {
            e.preventDefault();
            alert('Cards in the References column are locked and cannot be moved.');
            return;
        }
        
        state.draggedCard = cardId;
        e.target.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragEnd = (e) => {
        e.target.classList.remove('dragging');
        state.draggedCard = null;
        
        // Remove all drag-over classes
        document.querySelectorAll('.column-cards').forEach(col => {
            col.classList.remove('drag-over');
        });
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        e.currentTarget.classList.add('drag-over');
    };

    const handleDragLeave = (e) => {
        if (e.currentTarget === e.target) {
            e.currentTarget.classList.remove('drag-over');
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.currentTarget.classList.remove('drag-over');
        
        if (!state.draggedCard) return;
        
        const board = getCurrentBoard();
        const toColumnId = e.currentTarget.dataset.columnId;
        
        // Check if target column is locked
        const toColumn = board.columns.find(col => col.id === toColumnId);
        if (toColumn && toColumn.locked) {
            alert('Cannot drop cards into the References column (it is locked).');
            return;
        }
        
        moveCard(board, state.draggedCard, toColumnId);
        saveBoards();
        renderColumns(board);
    };

    // ===== MODAL SYSTEM =====
    const openModal = (title, bodyHTML, onOpen = () => {}) => {
        const backdrop = document.getElementById('modal-backdrop');
        const titleEl = document.getElementById('modal-title');
        const bodyEl = document.getElementById('modal-body');
        
        titleEl.textContent = title;
        bodyEl.innerHTML = bodyHTML;
        backdrop.classList.remove('hidden');
        
        onOpen();
    };

    const closeModal = () => {
        const backdrop = document.getElementById('modal-backdrop');
        backdrop.classList.add('hidden');
        backdrop.classList.remove('secondary-modal'); // Remove secondary class when closing
    };

    const openCardModal = (title, bodyHTML, onOpen = () => {}) => {
        const backdrop = document.getElementById('card-modal-backdrop');
        const titleEl = document.getElementById('card-modal-title');
        const bodyEl = document.getElementById('card-modal-body');
        
        titleEl.textContent = title;
        bodyEl.innerHTML = bodyHTML;
        backdrop.classList.remove('hidden');
        
        onOpen();
    };

    const closeCardModal = () => {
        const backdrop = document.getElementById('card-modal-backdrop');
        backdrop.classList.add('hidden');
    };

    // ===== UI ACTIONS =====
    const ui = {
        // Board creation dialogs
        showCreateBoardDialog: () => {
            const modal = document.getElementById('create-board-modal');
            if (modal) {
                document.getElementById('new-board-name').value = '';
                document.getElementById('new-board-description').value = '';
                document.getElementById('include-references-column').checked = true;
                modal.classList.remove('hidden');
            }
        },
        
        closeCreateBoardDialog: () => {
            const modal = document.getElementById('create-board-modal');
            if (modal) modal.classList.add('hidden');
        },
        
        // ===== MILESTONE UI =====
        showCreateMilestoneDialog: () => {
            const board = getCurrentBoard();
            openModal('Create Milestone', `
                <form id="create-milestone-form" class="modal-form">
                    <label for="milestone-name">Milestone Name *</label>
                    <input type="text" id="milestone-name" required autofocus placeholder="e.g., Sprint 1, Q4 Goals">
                    
                    <label for="milestone-description">Description (optional)</label>
                    <textarea id="milestone-description" rows="2" placeholder="What does this milestone represent?"></textarea>
                    
                    <label for="milestone-color">Color</label>
                    <input type="color" id="milestone-color" value="#4a6cf7">
                    
                    <div class="modal-actions">
                        <button type="button" class="btn-secondary" onclick="PPM.closeModal()">Cancel</button>
                        <button type="submit" class="btn-primary">Create Milestone</button>
                    </div>
                </form>
            `, () => {
                document.getElementById('create-milestone-form').addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const name = document.getElementById('milestone-name').value.trim();
                    const description = document.getElementById('milestone-description').value.trim();
                    const color = document.getElementById('milestone-color').value;
                    
                    if (name) {
                        createMilestone(board, { name, description, color });
                        await saveBoards();
                        closeModal();
                        renderMilestones(board);
                    }
                });
            });
        },

        showEditMilestoneDialog: (milestoneId) => {
            const board = getCurrentBoard();
            const milestone = getMilestoneById(board, milestoneId);
            if (!milestone) return;
            
            openModal('Edit Milestone', `
                <form id="edit-milestone-form" class="modal-form">
                    <label for="edit-milestone-name">Milestone Name *</label>
                    <input type="text" id="edit-milestone-name" value="${milestone.name}" required autofocus>
                    
                    <label for="edit-milestone-description">Description</label>
                    <textarea id="edit-milestone-description" rows="2">${milestone.description || ''}</textarea>
                    
                    <label for="edit-milestone-color">Color</label>
                    <input type="color" id="edit-milestone-color" value="${milestone.color}">
                    
                    <div class="modal-actions">
                        <button type="button" class="btn-secondary" onclick="PPM.closeModal()">Cancel</button>
                        <button type="submit" class="btn-primary">Save Changes</button>
                    </div>
                </form>
            `, () => {
                document.getElementById('edit-milestone-form').addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const name = document.getElementById('edit-milestone-name').value.trim();
                    const description = document.getElementById('edit-milestone-description').value.trim();
                    const color = document.getElementById('edit-milestone-color').value;
                    
                    if (name) {
                        updateMilestone(board, milestoneId, { name, description, color });
                        await saveBoards();
                        closeModal();
                        renderMilestones(board);
                    }
                });
            });
        },

        showMilestoneDetails: (milestoneId) => {
            const board = getCurrentBoard();
            const milestone = getMilestoneById(board, milestoneId);
            if (!milestone) return;
            
            const linkedCards = milestone.linkedCards.map(cardId => {
                const card = board.cards.find(c => c.id === cardId);
                const column = board.columns.find(col => col.id === card?.columnId);
                return card ? { card, column } : null;
            }).filter(Boolean);
            
            openModal(`Milestone: ${milestone.name}`, `
                <div class="modal-form">
                    <p><strong>Status:</strong> ${milestone.status === 'completed' ? '✅ Completed' : '⏳ In Progress'}</p>
                    <p><strong>Description:</strong> ${milestone.description || 'No description'}</p>
                    <p><strong>Linked Cards:</strong> ${linkedCards.length}</p>
                    
                    ${linkedCards.length > 0 ? `
                        <div class="linked-cards-list" style="margin-top: 1rem;">
                            ${linkedCards.map(({ card, column }) => `
                                <div class="linked-card-item" style="padding: 0.5rem; background: var(--bg-secondary); border-radius: 4px; margin-bottom: 0.5rem;">
                                    <strong>${card.title}</strong>
                                    <br><small style="color: var(--text-secondary);">${column?.name || 'Unknown column'}</small>
                                </div>
                            `).join('')}
                        </div>
                    ` : '<p style="color: var(--text-secondary); font-style: italic;">No cards linked to this milestone yet.</p>'}
                    
                    <div class="modal-actions">
                        <button type="button" class="btn-secondary" onclick="PPM.closeModal()">Close</button>
                    </div>
                </div>
            `);
        },

        deleteMilestoneConfirm: async (milestoneId) => {
            const board = getCurrentBoard();
            const milestone = getMilestoneById(board, milestoneId);
            if (!milestone) return;
            
            if (confirm(`Delete milestone "${milestone.name}"?\n\nCards will remain but won't be linked to this milestone.`)) {
                deleteMilestone(board, milestoneId);
                await saveBoards();
                renderMilestones(board);
                renderColumns(board);
            }
        },

        // ===== CATEGORY UI =====
        showCreateCategoryDialog: () => {
            const board = getCurrentBoard();
            openModal('Create Category', `
                <form id="create-category-form" class="modal-form">
                    <label for="category-name">Category Name *</label>
                    <input type="text" id="category-name" required autofocus placeholder="e.g., Frontend, Backend, Design">
                    
                    <label for="category-color">Color</label>
                    <input type="color" id="category-color" value="#28a745">
                    
                    <div class="modal-actions">
                        <button type="button" class="btn-secondary" onclick="PPM.closeModal()">Cancel</button>
                        <button type="submit" class="btn-primary">Create Category</button>
                    </div>
                </form>
            `, () => {
                document.getElementById('create-category-form').addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const name = document.getElementById('category-name').value.trim();
                    const color = document.getElementById('category-color').value;
                    
                    if (name) {
                        createCategory(board, { name, color });
                        await saveBoards();
                        closeModal();
                        renderCategories(board);
                    }
                });
            });
        },

        showEditCategoryDialog: (categoryId) => {
            const board = getCurrentBoard();
            const category = getCategoryById(board, categoryId);
            if (!category) return;
            
            openModal('Edit Category', `
                <form id="edit-category-form" class="modal-form">
                    <label for="edit-category-name">Category Name *</label>
                    <input type="text" id="edit-category-name" value="${category.name}" required autofocus>
                    
                    <label for="edit-category-color">Color</label>
                    <input type="color" id="edit-category-color" value="${category.color}">
                    
                    <div class="modal-actions">
                        <button type="button" class="btn-secondary" onclick="PPM.closeModal()">Cancel</button>
                        <button type="submit" class="btn-primary">Save Changes</button>
                    </div>
                </form>
            `, () => {
                document.getElementById('edit-category-form').addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const name = document.getElementById('edit-category-name').value.trim();
                    const color = document.getElementById('edit-category-color').value;
                    
                    if (name) {
                        updateCategory(board, categoryId, { name, color });
                        await saveBoards();
                        closeModal();
                        renderCategories(board);
                    }
                });
            });
        },

        deleteCategoryConfirm: async (categoryId) => {
            const board = getCurrentBoard();
            const category = getCategoryById(board, categoryId);
            if (!category) return;
            
            const cardCount = board.cards.filter(c => c.categoryId === categoryId).length;
            if (confirm(`Delete category "${category.name}"?\n\n${cardCount} card(s) will lose their category assignment.`)) {
                deleteCategory(board, categoryId);
                await saveBoards();
                renderCategories(board);
                renderColumns(board);
            }
        },

        toggleCategoryFilter: (categoryId) => {
            state.categoryFilter = state.categoryFilter === categoryId ? null : categoryId;
            const board = getCurrentBoard();
            renderCategories(board);
            renderColumns(board);
        },

        // ===== GROUP UI =====
        showCreateGroupDialog: () => {
            const board = getCurrentBoard();
            openModal('Create Group', `
                <form id="create-group-form" class="modal-form">
                    <label for="group-name">Group Name *</label>
                    <input type="text" id="group-name" required autofocus placeholder="e.g., Critical Tasks, Design Sprint">
                    
                    <label for="group-color">Color</label>
                    <input type="color" id="group-color" value="#ffc107">
                    
                    <div class="modal-actions">
                        <button type="button" class="btn-secondary" onclick="PPM.closeModal()">Cancel</button>
                        <button type="submit" class="btn-primary">Create Group</button>
                    </div>
                </form>
            `, () => {
                document.getElementById('create-group-form').addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const name = document.getElementById('group-name').value.trim();
                    const color = document.getElementById('group-color').value;
                    
                    if (name) {
                        createGroup(board, { name, color });
                        await saveBoards();
                        closeModal();
                        renderGroups(board);
                    }
                });
            });
        },

        showEditGroupDialog: (groupId) => {
            const board = getCurrentBoard();
            const group = getGroupById(board, groupId);
            if (!group) return;
            
            openModal('Edit Group', `
                <form id="edit-group-form" class="modal-form">
                    <label for="edit-group-name">Group Name *</label>
                    <input type="text" id="edit-group-name" value="${group.name}" required autofocus>
                    
                    <label for="edit-group-color">Color</label>
                    <input type="color" id="edit-group-color" value="${group.color}">
                    
                    <div class="modal-actions">
                        <button type="button" class="btn-secondary" onclick="PPM.closeModal()">Cancel</button>
                        <button type="submit" class="btn-primary">Save Changes</button>
                    </div>
                </form>
            `, () => {
                document.getElementById('edit-group-form').addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const name = document.getElementById('edit-group-name').value.trim();
                    const color = document.getElementById('edit-group-color').value;
                    
                    if (name) {
                        updateGroup(board, groupId, { name, color });
                        await saveBoards();
                        closeModal();
                        renderGroups(board);
                    }
                });
            });
        },

        showGroupDetails: (groupId) => {
            const board = getCurrentBoard();
            const group = getGroupById(board, groupId);
            if (!group) return;
            
            const linkedCards = group.linkedCards.map(cardId => {
                const card = board.cards.find(c => c.id === cardId);
                const column = board.columns.find(col => col.id === card?.columnId);
                return card ? { card, column } : null;
            }).filter(Boolean);
            
            openModal(`Group: ${group.name}`, `
                <div class="modal-form">
                    <p><strong>Cards in Group:</strong> ${linkedCards.length}</p>
                    
                    ${linkedCards.length > 0 ? `
                        <div class="linked-cards-list" style="margin-top: 1rem;">
                            ${linkedCards.map(({ card, column }) => `
                                <div class="linked-card-item" style="padding: 0.5rem; background: var(--bg-secondary); border-radius: 4px; margin-bottom: 0.5rem;">
                                    <strong>${card.title}</strong>
                                    <br><small style="color: var(--text-secondary);">${column?.name || 'Unknown column'}</small>
                                </div>
                            `).join('')}
                        </div>
                    ` : '<p style="color: var(--text-secondary); font-style: italic;">No cards in this group yet.</p>'}
                    
                    <div class="modal-actions">
                        <button type="button" class="btn-primary" onclick="PPM.ui.showGroupBulkActions('${groupId}')">Bulk Actions</button>
                        <button type="button" class="btn-secondary" onclick="PPM.closeModal()">Close</button>
                    </div>
                </div>
            `);
        },

        showGroupBulkActions: (groupId) => {
            const board = getCurrentBoard();
            const group = getGroupById(board, groupId);
            if (!group || group.linkedCards.length === 0) {
                alert('No cards in this group for bulk actions.');
                return;
            }
            
            openModal(`Bulk Actions: ${group.name}`, `
                <div class="modal-form">
                    <p>Apply actions to all ${group.linkedCards.length} cards in this group:</p>
                    
                    <button type="button" class="btn-danger" style="width: 100%; margin-bottom: 0.5rem;" 
                            onclick="PPM.ui.bulkDeleteCards('${groupId}')">
                        <i class="fa-solid fa-trash"></i> Delete All Cards
                    </button>
                    
                    <p style="margin-top: 1rem; color: var(--text-secondary); font-size: 0.875rem;">
                        Note: More bulk actions (assign, move, label) can be added as needed.
                    </p>
                    
                    <div class="modal-actions">
                        <button type="button" class="btn-secondary" onclick="PPM.closeModal()">Close</button>
                    </div>
                </div>
            `);
        },

        bulkDeleteCards: async (groupId) => {
            const board = getCurrentBoard();
            const group = getGroupById(board, groupId);
            if (!group) return;
            
            if (confirm(`Delete all ${group.linkedCards.length} cards in group "${group.name}"?\n\nThis cannot be undone!`)) {
                group.linkedCards.forEach(cardId => {
                    const cardIndex = board.cards.findIndex(c => c.id === cardId);
                    if (cardIndex !== -1) {
                        board.cards.splice(cardIndex, 1);
                    }
                });
                
                group.linkedCards = [];
                
                await saveBoards();
                closeModal();
                renderGroups(board);
                renderColumns(board);
                
                alert('All cards deleted successfully.');
            }
        },

        deleteGroupConfirm: async (groupId) => {
            const board = getCurrentBoard();
            const group = getGroupById(board, groupId);
            if (!group) return;
            
            if (confirm(`Delete group "${group.name}"?\n\nCards will remain but won't be linked to this group.`)) {
                deleteGroup(board, groupId);
                await saveBoards();
                renderGroups(board);
                renderColumns(board);
            }
        },
        
        // Carousel navigation
        scrollCarousel: (type, direction) => {
            const container = document.getElementById(`${type}-container`);
            if (!container) return;
            
            const scrollAmount = 200; // pixels to scroll
            const currentScroll = container.scrollLeft;
            
            if (direction === 'next') {
                container.scrollLeft = currentScroll + scrollAmount;
            } else {
                container.scrollLeft = currentScroll - scrollAmount;
            }
        },
        
        openAddCardModal: (columnId) => {
            const board = getCurrentBoard();
            const column = getColumnById(board, columnId);
            
            // Get References items for linking (if not adding to References)
            const referencesColumnId = board.columns[0]?.id;
            const referenceCards = columnId !== referencesColumnId ? getCardsByColumn(board, referencesColumnId) : [];
            
            openModal(`Add Task to ${column.name}`, `
                <form id="add-card-form" class="modal-form">
                    <label for="card-title">Task Title *</label>
                    <input type="text" id="card-title" required autofocus>
                    
                    <label for="card-description">Description</label>
                    <textarea id="card-description" rows="3"></textarea>
                    
                    ${referenceCards.length > 0 ? `
                        <label>Link to Reference Items (optional)</label>
                        <div class="backlog-selector">
                            ${referenceCards.map(bc => `
                                <label class="checkbox-label">
                                    <input type="checkbox" name="backlog-link" value="${bc.id}">
                                    <span>${bc.title}</span>
                                </label>
                            `).join('')}
                        </div>
                    ` : ''}
                    
                    <div class="modal-actions">
                        <button type="button" class="btn-secondary" onclick="PPM.closeModal()">Cancel</button>
                        <button type="submit" class="btn-primary">Add Task</button>
                    </div>
                </form>
            `, () => {
                const form = document.getElementById('add-card-form');
                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    const title = document.getElementById('card-title').value.trim();
                    const description = document.getElementById('card-description').value.trim();
                    
                    // Get selected backlog items
                    const linkedBacklogItems = Array.from(document.querySelectorAll('input[name="backlog-link"]:checked'))
                        .map(cb => cb.value);
                    
                    if (title) {
                        createCard(board, columnId, { title, description, linkedBacklogItems });
                        saveBoards();
                        closeModal();
                        renderColumns(board);
                    }
                });
            });
        },
        
        openCardDetail: (cardId) => {
            const board = getCurrentBoard();
            const card = getCardById(board, cardId);
            if (!card) return;
            
            openCardModal(card.title, renderCardDetailBody(board, card), () => {
                setupCardDetailHandlers(board, card);
            });
        },
        
        openBoardMenuSingle: () => {
            const board = getCurrentBoard();
            if (!board) return;
            
            openModal(`Board Settings`, `
                <div class="column-menu">
                    <button class="menu-btn" onclick="PPM.ui.renameBoard('${board.id}')">
                        <i class="fa-solid fa-pen"></i> Rename Board
                    </button>
                    <button class="menu-btn" onclick="PPM.ui.addColumnFromMenu()">
                        <i class="fa-solid fa-columns"></i> Add Column
                    </button>
                    <button class="menu-btn" onclick="PPM.ui.archiveBoard('${board.id}')">
                        <i class="fa-solid fa-archive"></i> Archive Board
                    </button>
                    <button class="menu-btn danger" onclick="PPM.ui.deleteBoard('${board.id}')">
                        <i class="fa-solid fa-trash"></i> Delete Board
                    </button>
                </div>
            `);
        },
        
        openColumnMenu: (e, columnId) => {
            e.stopPropagation();
            const board = getCurrentBoard();
            const column = getColumnById(board, columnId);
            
            openModal(`Column: ${column.name}`, `
                <div class="column-menu">
                    <button class="menu-btn" onclick="PPM.ui.addTaskFromMenu('${columnId}')">
                        <i class="fa-solid fa-plus"></i> Add Task
                    </button>
                    <button class="menu-btn" onclick="PPM.ui.renameColumn('${columnId}')">
                        <i class="fa-solid fa-pen"></i> Rename
                    </button>
                    <button class="menu-btn" onclick="PPM.ui.setColumnLimit('${columnId}')">
                        <i class="fa-solid fa-hashtag"></i> Set WIP Limit
                    </button>
                    <button class="menu-btn danger" onclick="PPM.ui.deleteColumn('${columnId}')">
                        <i class="fa-solid fa-trash"></i> Delete
                    </button>
                </div>
            `);
        },
        
        renameColumn: (columnId) => {
            const board = getCurrentBoard();
            const column = getColumnById(board, columnId);
            const newName = prompt('Column name:', column.name);
            if (newName && newName.trim()) {
                updateColumn(board, columnId, { name: newName.trim() });
                saveBoards();
                closeModal();
                renderColumns(board);
            }
        },
        
        setColumnLimit: (columnId) => {
            const board = getCurrentBoard();
            const column = getColumnById(board, columnId);
            const limit = prompt('WIP Limit (leave empty for no limit):', column.limit || '');
            const parsedLimit = limit === '' ? null : parseInt(limit, 10);
            if (limit === '' || !isNaN(parsedLimit)) {
                updateColumn(board, columnId, { limit: parsedLimit });
                saveBoards();
                closeModal();
                renderColumns(board);
            }
        },
        
        deleteColumn: (columnId) => {
            if (confirm('Delete this column? All cards will be moved to the first column.')) {
                const board = getCurrentBoard();
                deleteColumn(board, columnId);
                saveBoards();
                closeModal();
                renderColumns(board);
            }
        },
        
        addColumnFromMenu: () => {
            const board = getCurrentBoard();
            const name = prompt('Column name:');
            if (name && name.trim()) {
                addColumn(board, name.trim());
                saveBoards();
                closeModal();
                renderColumns(board);
            }
        },
        
        addTaskFromMenu: (columnId) => {
            closeModal();
            ui.openAddCardModal(columnId);
        },
        
        addMember: () => {
            const board = getCurrentBoard();
            if (!board) return;
            
            // Get all users not already members
            const currentMemberIds = board.members.map(m => m.userId);
            const availableUsers = state.users.filter(u => !currentMemberIds.includes(u.id));
            
            if (availableUsers.length === 0) {
                alert(`All ${state.users.length} users are already members of this board.\n\nCurrent members:\n${board.members.map(m => `• ${m.name}`).join('\n')}`);
                return;
            }
            
            openModal('Add Member to Board', `
                <div class="modal-form">
                    <p>Select a user to add to this board:</p>
                    <div class="user-selector">
                        ${availableUsers.map(user => `
                            <button class="user-select-btn" onclick="PPM.ui.confirmAddMember('${user.id}')">
                                <div class="member-avatar" style="display: inline-flex; margin-right: 10px;">
                                    <span>${user.name.split(' ').map(n => n[0]).join('').toUpperCase()}</span>
                                </div>
                                <span>${user.name}</span>
                            </button>
                        `).join('')}
                    </div>
                </div>
            `);
        },
        
        confirmAddMember: (userId) => {
            const board = getCurrentBoard();
            const user = state.users.find(u => u.id === userId);
            
            if (user) {
                board.members.push({
                    userId: user.id,
                    name: user.name,
                    avatar: user.avatar || null,
                    addedAt: new Date().toISOString()
                });
                
                saveBoards();
                closeModal();
                renderBoardMembers(board);
            }
        },
        
        openBoardMenu: (e, boardId) => {
            e.stopPropagation();
            const board = state.boards.find(b => b.id === boardId);
            
            openModal(`Board: ${board.name}`, `
                <div class="board-menu">
                    <button class="menu-btn" onclick="PPM.ui.renameBoard('${boardId}')">
                        <i class="fa-solid fa-pen"></i> Rename
                    </button>
                    <button class="menu-btn" onclick="PPM.ui.archiveBoard('${boardId}')">
                        <i class="fa-solid fa-archive"></i> Archive
                    </button>
                    <button class="menu-btn danger" onclick="PPM.ui.deleteBoard('${boardId}')">
                        <i class="fa-solid fa-trash"></i> Delete
                    </button>
                </div>
            `);
        },
        
        renameBoard: (boardId) => {
            const board = state.boards.find(b => b.id === boardId);
            const newName = prompt('Board name:', board.name);
            if (newName && newName.trim()) {
                board.name = newName.trim();
                saveBoards();
                closeModal();
                if (state.view === 'boards') {
                    renderBoardsView();
                } else {
                    renderBoardView();
                }
            }
        },
        
        archiveBoard: (boardId) => {
            const board = state.boards.find(b => b.id === boardId);
            board.archived = true;
            saveBoards();
            closeModal();
            renderBoardsView();
        },
        
        deleteBoard: (boardId) => {
            if (confirm('Permanently delete this board and all its cards?')) {
                state.boards = state.boards.filter(b => b.id !== boardId);
                saveBoards();
                closeModal();
                renderBoardsView();
            }
        }
    };

    const renderCardDetailBody = (board, card) => {
        const executors = card.assignments.filter(a => a.role === 'executor');
        const approvers = card.assignments.filter(a => a.role === 'approver');
        const followers = card.assignments.filter(a => a.role === 'follower');
        const supervisors = card.assignments.filter(a => a.role === 'supervisor');
        
        return `
            <div class="card-detail">
                <div class="card-detail-main">
                    <div class="detail-section">
                        <label>Description</label>
                        <textarea id="card-desc-edit" rows="4" onchange="PPM.ui.updateDescription('${card.id}', this.value)">${card.description || ''}</textarea>
                    </div>
                    
                    <div class="detail-section">
                        <label>Milestone</label>
                        <select id="card-milestone" onchange="PPM.ui.updateMilestone('${card.id}', this.value)">
                            <option value="">No Milestone</option>
                            ${board.milestones.map(m => `
                                <option value="${m.id}" ${card.milestoneId === m.id ? 'selected' : ''}>
                                    ${m.name}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                    
                    <div class="detail-section">
                        <label>Category</label>
                        <select id="card-category" onchange="PPM.ui.updateCategory('${card.id}', this.value)">
                            <option value="">No Category</option>
                            ${board.categories.map(c => `
                                <option value="${c.id}" ${card.categoryId === c.id ? 'selected' : ''}>
                                    ${c.name}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                    
                    <div class="detail-section">
                        <label>Groups</label>
                        <div class="groups-selector">
                            ${board.groups.length > 0 ? board.groups.map(g => `
                                <label class="checkbox-label">
                                    <input type="checkbox" 
                                           value="${g.id}" 
                                           ${card.groupIds && card.groupIds.includes(g.id) ? 'checked' : ''}
                                           onchange="PPM.ui.toggleGroup('${card.id}', '${g.id}', this.checked)">
                                    <span>${g.name}</span>
                                </label>
                            `).join('') : '<p class="empty-message">No groups available</p>'}
                        </div>
                    </div>
                    
                    ${board.dynamicList && board.dynamicList.nodes && board.dynamicList.nodes.filter(n => n.type === 'connection').length > 0 ? `
                        <div class="detail-section">
                            <label>
                                <i class="fa-solid fa-sitemap"></i> Dynamic List Connections
                            </label>
                            <small class="form-hint">Link this task to connection nodes for filtering</small>
                            <div class="dynamic-list-connections">
                                ${board.dynamicList.nodes.filter(n => n.type === 'connection').map(node => {
                                    const isLinked = node.linkedTaskIds && node.linkedTaskIds.includes(card.id);
                                    const level = node.level || 0;
                                    const indent = level * 15;
                                    return `
                                        <label class="checkbox-label" style="padding-left: ${indent}px;">
                                            <input type="checkbox" 
                                                   value="${node.id}" 
                                                   ${isLinked ? 'checked' : ''}
                                                   onchange="PPM.ui.toggleNodeConnection('${card.id}', '${node.id}', this.checked)">
                                            <span>${node.title}</span>
                                        </label>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    ` : ''}
                    
                    ${card.checklist.length > 0 ? `
                        <div class="detail-section">
                            <label>Checklist</label>
                            <div class="checklist">
                                ${card.checklist.map((item, i) => `
                                    <div class="checklist-item">
                                        <input type="checkbox" id="check-${i}" ${item.completed ? 'checked' : ''} 
                                               onchange="PPM.ui.toggleChecklistItem('${card.id}', ${i})">
                                        <label for="check-${i}">${item.text}</label>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                    
                    ${card.attachments.length > 0 ? `
                        <div class="detail-section">
                            <label>Attachments</label>
                            <div class="attachments-list">
                                ${card.attachments.map((att, idx) => `
                                    <div class="attachment-item clickable" onclick="PPM.ui.openAttachment('${card.id}', ${idx})">
                                        <i class="fa-solid fa-${att.type === 'link' ? 'link' : att.type === 'image' ? 'image' : att.type === 'note' ? 'book-open' : 'comment'}"></i>
                                        <span>${att.title}</span>
                                        ${att.type === 'link' ? `<i class="fa-solid fa-external-link-alt" style="margin-left: auto; font-size: 0.85em; opacity: 0.6;"></i>` : ''}
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
                
                <div class="card-detail-sidebar">
                    <div class="detail-section">
                        <label>Executors 👷</label>
                        <div class="assignments">
                            ${executors.map(a => {
                                const user = getUserById(a.userId);
                                return user ? `<div class="assignment-item">${user.name}</div>` : '';
                            }).join('') || '<p class="text-muted">None assigned</p>'}
                        </div>
                        <button class="btn-secondary btn-sm" onclick="PPM.ui.assignToCard('${card.id}', 'executor')">
                            <i class="fa-solid fa-plus"></i> Assign Executor
                        </button>
                    </div>
                    
                    <div class="detail-section">
                        <label>Approvers ✅</label>
                        <div class="assignments">
                            ${approvers.map(a => {
                                const user = getUserById(a.userId);
                                return user ? `<div class="assignment-item">${user.name}</div>` : '';
                            }).join('') || '<p class="text-muted">None assigned</p>'}
                        </div>
                        <button class="btn-secondary btn-sm" onclick="PPM.ui.assignToCard('${card.id}', 'approver')">
                            <i class="fa-solid fa-plus"></i> Assign Approver
                        </button>
                    </div>
                    
                    <div class="detail-section">
                        <label>Followers 👁️</label>
                        <div class="assignments">
                            ${followers.map(a => {
                                const user = getUserById(a.userId);
                                return user ? `<div class="assignment-item">${user.name}</div>` : '';
                            }).join('') || '<p class="text-muted">None assigned</p>'}
                        </div>
                        <button class="btn-secondary btn-sm" onclick="PPM.ui.assignToCard('${card.id}', 'follower')">
                            <i class="fa-solid fa-plus"></i> Assign Follower
                        </button>
                    </div>
                    
                    <div class="detail-section">
                        <label>Supervisors 📊</label>
                        <div class="assignments">
                            ${supervisors.map(a => {
                                const user = getUserById(a.userId);
                                return user ? `<div class="assignment-item">${user.name}</div>` : '';
                            }).join('') || '<p class="text-muted">None assigned</p>'}
                        </div>
                        <button class="btn-secondary btn-sm" onclick="PPM.ui.assignToCard('${card.id}', 'supervisor')">
                            <i class="fa-solid fa-plus"></i> Assign Supervisor
                        </button>
                    </div>
                    
                    ${card.columnId !== board.columns[0]?.id ? `
                        <div class="detail-section">
                            <label>Linked Backlog Items 🔗</label>
                            <div class="linked-backlog-items">
                                ${card.linkedBacklogItems.length > 0 ? 
                                    card.linkedBacklogItems.map(itemId => {
                                        const backlogCard = getCardById(board, itemId);
                                        return backlogCard ? `<div class="linked-item">${backlogCard.title}</div>` : '';
                                    }).join('') 
                                    : '<p class="text-muted">Not linked to any backlog items</p>'}
                            </div>
                            <button class="btn-secondary btn-sm" onclick="PPM.ui.linkToBacklog('${card.id}')">
                                <i class="fa-solid fa-link"></i> Link to Backlog
                            </button>
                        </div>
                    ` : ''}
                    
                    <div class="detail-section">
                        <label>Due Date</label>
                        <input type="date" id="card-due-date" value="${card.schedule.dueDate || ''}" 
                               onchange="PPM.ui.updateDueDate('${card.id}', this.value)">
                    </div>
                    
                    <div class="detail-section">
                        <button class="btn-danger btn-block" onclick="PPM.ui.deleteCardFromDetail('${card.id}')">
                            <i class="fa-solid fa-trash"></i> Delete Task
                        </button>
                    </div>
                </div>
            </div>
        `;
    };

    const setupCardDetailHandlers = (board, card) => {
        const descArea = document.getElementById('card-desc-edit');
        if (descArea) {
            descArea.addEventListener('blur', () => {
                card.description = descArea.value.trim();
                saveBoards();
            });
        }
    };

    ui.toggleChecklistItem = (cardId, index) => {
        const board = getCurrentBoard();
        const card = getCardById(board, cardId);
        if (card && card.checklist[index]) {
            card.checklist[index].completed = !card.checklist[index].completed;
            card.checklist[index].completedBy = card.checklist[index].completed ? state.currentUser?.id : null;
            card.checklist[index].completedAt = card.checklist[index].completed ? new Date().toISOString() : null;
            saveBoards();
        }
    };

    ui.assignToCard = (cardId, role) => {
        const board = getCurrentBoard();
        const card = getCardById(board, cardId);
        
        // For now, show simple prompt (in full version, would be a searchable user list)
        const userName = prompt(`Enter user name to assign as ${role}:`);
        if (!userName) return;
        
        // Find or create user
        let user = state.users.find(u => u.name.toLowerCase() === userName.toLowerCase());
        if (!user) {
            user = {
                id: generateId('user'),
                name: userName,
                email: userName.toLowerCase().replace(/\s/g, '.') + '@company.com',
                avatar: '',
                role: 'member',
                department: '',
                position: '',
                notifications: {
                    email: true,
                    browser: true,
                    assignments: true,
                    mentions: true,
                    reminders: true
                },
                preferences: {
                    theme: 'light',
                    boardView: 'kanban',
                    timezone: 'Europe/Brussels'
                },
                createdAt: new Date().toISOString()
            };
            state.users.push(user);
            saveUsers();
        }
        
        // Add to board members if not already
        if (!board.members.find(m => m.userId === user.id)) {
            board.members.push({
                userId: user.id,
                name: user.name,
                email: user.email,
                role: 'member',
                avatar: user.avatar,
                joinedAt: new Date().toISOString()
            });
        }
        
        assignUser(board, cardId, user.id, role);
        saveBoards();
        closeCardModal();
        ui.openCardDetail(cardId);
    };

    ui.updateDescription = (cardId, description) => {
        const board = getCurrentBoard();
        updateCard(board, cardId, { description });
        saveBoards();
    };
    
    ui.updateMilestone = async (cardId, milestoneId) => {
        const board = getCurrentBoard();
        const card = getCardById(board, cardId);
        
        // Remove from old milestone
        if (card.milestoneId) {
            const oldMilestone = getMilestoneById(board, card.milestoneId);
            if (oldMilestone) {
                oldMilestone.linkedCards = oldMilestone.linkedCards.filter(id => id !== cardId);
                updateMilestoneStatus(board, card.milestoneId);
            }
        }
        
        // Add to new milestone
        if (milestoneId) {
            const newMilestone = getMilestoneById(board, milestoneId);
            if (newMilestone && !newMilestone.linkedCards.includes(cardId)) {
                newMilestone.linkedCards.push(cardId);
            }
            updateCard(board, cardId, { milestoneId });
            updateMilestoneStatus(board, milestoneId);
        } else {
            updateCard(board, cardId, { milestoneId: null });
        }
        
        await saveBoards();
        renderMilestones(board);
    };
    
    ui.updateCategory = async (cardId, categoryId) => {
        const board = getCurrentBoard();
        updateCard(board, cardId, { categoryId: categoryId || null });
        await saveBoards();
        renderCategories(board);
    };
    
    ui.toggleGroup = async (cardId, groupId, checked) => {
        const board = getCurrentBoard();
        const card = getCardById(board, cardId);
        const group = getGroupById(board, groupId);
        
        if (!card || !group) return;
        
        // Ensure groupIds array exists
        if (!card.groupIds) card.groupIds = [];
        
        if (checked) {
            // Add to group
            if (!card.groupIds.includes(groupId)) {
                card.groupIds.push(groupId);
            }
            if (!group.linkedCards.includes(cardId)) {
                group.linkedCards.push(cardId);
            }
        } else {
            // Remove from group
            card.groupIds = card.groupIds.filter(id => id !== groupId);
            group.linkedCards = group.linkedCards.filter(id => id !== cardId);
        }
        
        await saveBoards();
        renderGroups(board);
    };
    
    ui.toggleNodeConnection = async (cardId, nodeId, checked) => {
        try {
            const board = getCurrentBoard();
            if (!board || !board.dynamicList) {
                console.error('Board or dynamicList not found');
                return;
            }
            
            const node = board.dynamicList.nodes.find(n => n.id === nodeId);
            if (!node) {
                console.error('Node not found:', nodeId);
                return;
            }
            
            // Ensure linkedTaskIds array exists
            if (!node.linkedTaskIds) {
                node.linkedTaskIds = [];
            }
            
            if (checked) {
                // Add card to node's linked tasks
                if (!node.linkedTaskIds.includes(cardId)) {
                    node.linkedTaskIds.push(cardId);
                }
            } else {
                // Remove card from node's linked tasks
                node.linkedTaskIds = node.linkedTaskIds.filter(id => id !== cardId);
            }
            
            await saveBoards();
            
            // Re-render dynamic list to update task counts
            if (PPM.dynamicList) {
                PPM.dynamicList.render();
            }
            
            console.log(`${checked ? 'Linked' : 'Unlinked'} card ${cardId} ${checked ? 'to' : 'from'} node ${nodeId}`);
        } catch (err) {
            console.error('toggleNodeConnection error:', err);
            alert('Failed to update node connection: ' + err.message);
        }
    };
    
    ui.updateDueDate = (cardId, dateValue) => {
        const board = getCurrentBoard();
        const card = getCardById(board, cardId);
        if (card) {
            card.schedule.dueDate = dateValue || null;
            saveBoards();
            renderColumns(board);
        }
    };

    ui.deleteCardFromDetail = (cardId) => {
        if (confirm('Delete this task permanently?')) {
            const board = getCurrentBoard();
            deleteCard(board, cardId);
            saveBoards();
            closeCardModal();
            renderColumns(board);
        }
    };
    
    ui.filterByBacklog = (cardId) => {
        // Toggle filter
        if (state.backlogFilter === cardId) {
            state.backlogFilter = null;
        } else {
            state.backlogFilter = cardId;
            
            // Check if any tasks are linked to this backlog item
            const board = getCurrentBoard();
            const linkedCount = board.cards.filter(c => 
                c.linkedBacklogItems && c.linkedBacklogItems.includes(cardId)
            ).length;
            
            if (linkedCount === 0) {
                alert(`No tasks are linked to this backlog item yet.\n\nTo link tasks:\n1. Open any task outside the Backlog column\n2. Click "Link to Backlog" in the task details\n3. Select this backlog item\n\nOr when creating a new task, select backlog items to link.`);
                state.backlogFilter = null;
                return;
            }
        }
        
        const board = getCurrentBoard();
        renderColumns(board);
        updateBacklogFilterBanner();
    };
    
    ui.clearBacklogFilter = () => {
        state.backlogFilter = null;
        const board = getCurrentBoard();
        renderColumns(board);
        updateBacklogFilterBanner();
    };
    
    ui.openAttachment = (cardId, attIndex) => {
        const board = getCurrentBoard();
        const card = getCardById(board, cardId);
        if (!card || !card.attachments[attIndex]) return;
        
        const att = card.attachments[attIndex];
        
        if (att.type === 'link') {
            window.open(att.url, '_blank');
        } else if (att.type === 'image') {
            openModal(att.title, `
                <div class="attachment-viewer">
                    <img src="${att.url}" alt="${att.title}" style="max-width: 100%; max-height: 70vh;">
                </div>
            `);
        } else if (att.type === 'note') {
            openModal(att.title, `
                <div class="attachment-viewer">
                    <div style="white-space: pre-wrap;">${att.content || ''}</div>
                </div>
            `);
        } else if (att.type === 'comment') {
            openModal(att.title, `
                <div class="attachment-viewer">
                    <div style="white-space: pre-wrap;">${att.content || ''}</div>
                </div>
            `);
        }
    };
    
    ui.linkToBacklog = (cardId) => {
        const board = getCurrentBoard();
        const card = getCardById(board, cardId);
        const backlogColumnId = board.columns[0]?.id;
        // Get all backlog cards without filter
        const backlogCards = board.cards.filter(c => c.columnId === backlogColumnId).sort((a, b) => a.order - b.order);
        
        if (backlogCards.length === 0) {
            alert('No backlog items available to link.');
            return;
        }
        
        openModal('Link to Backlog Items', `
            <div class="modal-form">
                <p>Select backlog items to link this task to:</p>
                <div class="backlog-selector">
                    ${backlogCards.map(bc => `
                        <label class="checkbox-label">
                            <input type="checkbox" name="backlog-link-update" value="${bc.id}" 
                                   ${card.linkedBacklogItems.includes(bc.id) ? 'checked' : ''}>
                            <span>${bc.title}</span>
                        </label>
                    `).join('')}
                </div>
                <div class="modal-actions" style="margin-top: 20px;">
                    <button type="button" class="btn-secondary" onclick="PPM.closeModal()">Cancel</button>
                    <button type="button" class="btn-primary" onclick="PPM.ui.saveBacklogLinks('${cardId}')">Save</button>
                </div>
            </div>
        `);
    };
    
    ui.saveBacklogLinks = (cardId) => {
        const board = getCurrentBoard();
        const card = getCardById(board, cardId);
        
        const linkedBacklogItems = Array.from(document.querySelectorAll('input[name="backlog-link-update"]:checked'))
            .map(cb => cb.value);
        
        updateCard(board, cardId, { linkedBacklogItems });
        saveBoards();
        closeModal();
        
        // Reopen card detail to show updated links
        ui.openCardDetail(cardId);
    };
    
    const updateBacklogFilterBanner = () => {
        const banner = document.getElementById('backlog-filter-banner');
        const label = document.getElementById('backlog-filter-label');
        
        if (!banner || !label) return;
        
        if (state.backlogFilter) {
            const board = getCurrentBoard();
            const backlogCard = getCardById(board, state.backlogFilter);
            
            if (backlogCard) {
                label.textContent = backlogCard.title;
                banner.classList.remove('hidden');
            }
        } else {
            banner.classList.add('hidden');
        }
    };

    // ===== THEME =====
    const toggleTheme = () => {
        state.theme = state.theme === 'light' ? 'dark' : 'light';
        document.body.classList.toggle('dark-theme', state.theme === 'dark');
        localStorage.setItem('ppmTheme', state.theme);
    };

    const initTheme = () => {
        const saved = localStorage.getItem('ppmTheme');
        if (saved) {
            state.theme = saved;
            document.body.classList.toggle('dark-theme', state.theme === 'dark');
        }
    };

    // ===== INITIALIZATION =====
    const init = async (view, boardId = null) => {
        state.view = view;
        state.currentBoardId = boardId;
        
        initTheme();
        
        await loadBoards();
        await loadUsers();
        
        if (view === 'boards') {
            renderBoardsView();
        } else if (view === 'board') {
            renderBoardView();
            
            // Initialize dynamic list
            if (PPM.dynamicList) {
                PPM.dynamicList.init();
            }
        }
        
        // Setup global handlers
        document.getElementById('modal-close')?.addEventListener('click', closeModal);
        document.getElementById('modal-backdrop')?.addEventListener('click', (e) => {
            if (e.target.id === 'modal-backdrop') closeModal();
        });
        
        document.getElementById('card-modal-close')?.addEventListener('click', closeCardModal);
        document.getElementById('card-modal-backdrop')?.addEventListener('click', (e) => {
            if (e.target.id === 'card-modal-backdrop') closeCardModal();
        });
        
        document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);
        
        document.getElementById('create-board-btn')?.addEventListener('click', () => {
            ui.showCreateBoardDialog();
        });
        
        document.getElementById('create-board-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('new-board-name').value.trim();
            const description = document.getElementById('new-board-description').value.trim();
            const includeReferences = document.getElementById('include-references-column').checked;
            
            if (!name) {
                alert('Please enter a board name');
                return;
            }
            
            const board = createBoard(name, description, null, { includeReferences });
            await saveBoards();
            window.location.href = `board.html?id=${board.id}`;
        });
        
        document.getElementById('add-column-btn')?.addEventListener('click', () => {
            const board = getCurrentBoard();
            const name = prompt('Column name:');
            if (name && name.trim()) {
                addColumn(board, name.trim());
                saveBoards();
                renderColumns(board);
            }
        });
        
        document.getElementById('clear-backlog-filter')?.addEventListener('click', () => {
            ui.clearBacklogFilter();
        });
        
        document.getElementById('board-menu-btn')?.addEventListener('click', () => {
            ui.openBoardMenuSingle();
        });
        
        document.getElementById('add-member-btn')?.addEventListener('click', () => {
            ui.addMember();
        });
    };

    // ===== PUBLIC API =====
    return {
        init,
        state,
        ui,
        closeModal,
        closeCardModal,
        openCardModal,
        convertControlToBoard,
        saveBoards,
        createBoard,
        getCurrentBoard
    };
})();

// Make PPM available globally
window.PPM = PPM;
// ============================================================================
// DYNAMIC LIST TREE FEATURE
// ============================================================================

PPM.dynamicList = {
    currentNodeId: null,
    activeFilterNodeId: null,
    
    // Initialize dynamic list
    init: function() {
        try {
            const board = PPM.getCurrentBoard();
            if (!board) {
                console.error('Board not found in dynamicList.init()');
                return;
            }
            
            if (!board.dynamicList) {
                board.dynamicList = {
                    isActive: false,
                    nodes: []
                };
                PPM.saveBoards();
            }
            
            this.render();
            this.setupEventListeners();
        } catch (err) {
            console.error('dynamicList.init error:', err);
        }
    },
    
    // Setup event listeners
    setupEventListeners: function() {
        const toggleBtn = document.getElementById('toggle-dynamic-list');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggleCollapse());
        }
    },
    
    // Toggle collapse/expand
    toggleCollapse: function() {
        const container = document.getElementById('dynamic-list-container');
        const icon = document.querySelector('#toggle-dynamic-list i');
        container.classList.toggle('collapsed');
        icon.classList.toggle('fa-chevron-up');
        icon.classList.toggle('fa-chevron-down');
    },
    
    // Toggle mode (Creation/Active)
    toggleMode: function() {
        try {
            const board = PPM.getCurrentBoard();
            if (!board || !board.dynamicList) {
                console.error('Board or dynamicList not found');
                return;
            }
            board.dynamicList.isActive = !board.dynamicList.isActive;
            PPM.saveBoards();
            this.render();
            this.updateModeUI();
        } catch (err) {
            console.error('toggleMode error:', err);
            alert('Failed to toggle mode: ' + err.message);
        }
    },
    
    // Update mode UI
    updateModeUI: function() {
        try {
            const board = PPM.getCurrentBoard();
            if (!board || !board.dynamicList) return;
            
            const modeBtn = document.getElementById('dynamic-list-mode-btn');
            const modeText = document.getElementById('mode-text');
            
            if (!modeBtn || !modeText) {
                console.warn('Mode UI elements not found');
                return;
            }
            
            const icon = modeBtn.querySelector('i');
            if (!icon) {
                console.warn('Mode icon not found');
                return;
            }
            
            if (board.dynamicList.isActive) {
                modeText.textContent = 'Active';
                icon.className = 'fa-solid fa-check-circle';
                modeBtn.classList.add('mode-active');
            } else {
                modeText.textContent = 'Creation';
                icon.className = 'fa-solid fa-edit';
                modeBtn.classList.remove('mode-active');
            }
        } catch (err) {
            console.error('updateModeUI error:', err);
        }
    },
    
    // Render tree
    render: function() {
        try {
            const board = PPM.getCurrentBoard();
            if (!board || !board.dynamicList) {
                console.error('Board or dynamicList not found in render()');
                return;
            }
            
            const container = document.getElementById('dynamic-list-tree');
            const emptyState = document.getElementById('tree-empty-state');
            
            if (!container) {
                console.error('dynamic-list-tree container not found');
                return;
            }
        
        if (!board.dynamicList.nodes || board.dynamicList.nodes.length === 0) {
                if (emptyState) {
                    emptyState.classList.remove('hidden');
                }
                container.innerHTML = '';
                return;
            }
            
            if (emptyState) {
                emptyState.classList.add('hidden');
            }
        
        // Render root nodes
        const rootNodes = board.dynamicList.nodes.filter(n => !n.parentId);
        let html = '';
        
        for (const node of rootNodes) {
            html += this.renderNode(node, 0);
        }
        
        container.innerHTML = html;
            this.updateModeUI();
        } catch (err) {
            console.error('render() error:', err);
        }
    },
    
    // Render single node
    renderNode: function(node, level) {
        const board = PPM.getCurrentBoard();
        const children = board.dynamicList.nodes.filter(n => n.parentId === node.id);
        const hasChildren = children.length > 0;
        const isCollapsed = node.collapsed || false;
        const isActive = board.dynamicList.isActive;
        const isFiltered = this.activeFilterNodeId === node.id;
        
        // Get task count for connection nodes
        let taskCount = 0;
        if (node.type === 'connection') {
            taskCount = this.getLinkedTaskCount(node.id);
        }
        
        // Icon based on type
        const icon = node.type === 'task' ? 'fa-check-square' : 'fa-link';
        const typeClass = `node-${node.type}`;
        
        let html = `
            <div class="tree-node ${typeClass} ${isFiltered ? 'node-filtered' : ''}" 
                 data-node-id="${node.id}" 
                 data-level="${level}" 
                 style="margin-left: ${level * 20}px">
                <div class="node-content">
                    ${hasChildren ? `
                        <button class="node-toggle" onclick="PPM.dynamicList.toggleNode('${node.id}')">
                            <i class="fa-solid fa-chevron-${isCollapsed ? 'right' : 'down'}"></i>
                        </button>
                    ` : '<span class="node-spacer"></span>'}
                    
                    <span class="node-icon">
                        <i class="fa-solid ${icon}"></i>
                    </span>
                    
                    <span class="node-title" onclick="PPM.dynamicList.onNodeClick('${node.id}')">
                        ${node.title}
                        ${node.type === 'connection' && taskCount > 0 ? `<span class="task-count-badge">${taskCount}</span>` : ''}
                    </span>
                    
                    ${!isActive ? `
                        <div class="node-actions">
                            ${level < 9 ? `
                                <button class="btn-icon-sm" onclick="PPM.dynamicList.showNodeDialog('${node.id}')" title="Add child">
                                    <i class="fa-solid fa-plus"></i>
                                </button>
                            ` : ''}
                            <button class="btn-icon-sm" onclick="PPM.dynamicList.editNode('${node.id}')" title="Edit">
                                <i class="fa-solid fa-edit"></i>
                            </button>
                            <button class="btn-icon-sm btn-danger" onclick="PPM.dynamicList.deleteNode('${node.id}')" title="Delete">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
        
        // Render children if not collapsed
        if (hasChildren && !isCollapsed) {
            for (const child of children) {
                html += this.renderNode(child, level + 1);
            }
        }
        
        return html;
    },
    
    // Get linked task count (including descendants)
    getLinkedTaskCount: function(nodeId) {
        const board = PPM.getCurrentBoard();
        const taskIds = new Set();
        
        const addTasksRecursive = (nId) => {
            const node = board.dynamicList.nodes.find(n => n.id === nId);
            if (!node) return;
            
            // Add this node's tasks
            if (node.linkedTaskIds) {
                node.linkedTaskIds.forEach(id => taskIds.add(id));
            }
            
            // Add children's tasks
            const children = board.dynamicList.nodes.filter(n => n.parentId === nId);
            children.forEach(child => addTasksRecursive(child.id));
        };
        
        addTasksRecursive(nodeId);
        return taskIds.size;
    },
    
    // Toggle node collapse
    toggleNode: function(nodeId) {
        const board = PPM.getCurrentBoard();
        const node = board.dynamicList.nodes.find(n => n.id === nodeId);
        if (node) {
            node.collapsed = !node.collapsed;
            PPM.saveBoards();
            this.render();
        }
    },
    
    // Node click handler
    onNodeClick: function(nodeId) {
        const board = PPM.getCurrentBoard();
        const node = board.dynamicList.nodes.find(n => n.id === nodeId);
        
        if (!board.dynamicList.isActive) {
            return; // Do nothing in creation mode
        }
        
        if (node.type === 'task') {
            // Open task modal
            this.openTaskModal(nodeId);
        } else if (node.type === 'connection') {
            // Filter board by this node
            this.filterByNode(nodeId);
        }
    },
    
    // Open task modal for task nodes
    openTaskModal: function(nodeId) {
        try {
            const board = PPM.getCurrentBoard();
            const node = board.dynamicList.nodes.find(n => n.id === nodeId);
            
            if (!node) {
                alert('Node not found');
                return;
            }
            
            // Initialize task data if doesn't exist
            if (!node.taskData) {
                node.taskData = {
                    title: node.title,
                    description: '',
                    priority: 'medium',
                    tags: [],
                    checklist: [],
                    attachments: []
                };
            }
            
            // Render modal content for node task
            const modalContent = this.renderNodeTaskModal(board, node);
            
            // Open modal with custom content
            PPM.openCardModal(`✓ ${node.title}`, modalContent, () => {
                // On close, save any changes
                this.saveNodeTaskFromModal(nodeId);
            });
            
        } catch (err) {
            console.error('openTaskModal error:', err);
            alert('Failed to open task modal: ' + err.message);
        }
    },
    
    // Render modal content for node task
    renderNodeTaskModal: function(board, node) {
        const taskData = node.taskData;
        
        return `
            <div class="card-detail">
                <div class="card-detail-main">
                    <div class="detail-section">
                        <label>Title</label>
                        <input type="text" id="node-task-title" class="form-input" 
                               value="${node.title}" 
                               placeholder="Task title">
                    </div>
                    
                    <div class="detail-section">
                        <label>Description</label>
                        <textarea id="node-task-desc" rows="4" class="form-input"
                                  placeholder="Task description">${taskData.description || ''}</textarea>
                    </div>
                    
                    <div class="detail-section">
                        <label>Priority</label>
                        <select id="node-task-priority" class="form-input">
                            <option value="low" ${taskData.priority === 'low' ? 'selected' : ''}>Low</option>
                            <option value="medium" ${taskData.priority === 'medium' ? 'selected' : ''}>Medium</option>
                            <option value="high" ${taskData.priority === 'high' ? 'selected' : ''}>High</option>
                        </select>
                    </div>
                    
                    <div class="detail-section">
                        <label>Tags (comma-separated)</label>
                        <input type="text" id="node-task-tags" class="form-input"
                               value="${(taskData.tags || []).join(', ')}"
                               placeholder="tag1, tag2, tag3">
                    </div>
                    
                    ${taskData.checklist && taskData.checklist.length > 0 ? `
                        <div class="detail-section">
                            <label>Checklist</label>
                            <div class="checklist" id="node-task-checklist">
                                ${taskData.checklist.map((item, i) => `
                                    <div class="checklist-item">
                                        <input type="checkbox" 
                                               id="node-check-${i}" 
                                               ${item.completed ? 'checked' : ''}
                                               onchange="PPM.dynamicList.toggleNodeChecklistItem('${node.id}', ${i})">
                                        <label for="node-check-${i}">${item.text}</label>
                                        <button class="btn-icon-sm" onclick="PPM.dynamicList.removeNodeChecklistItem('${node.id}', ${i})">
                                            <i class="fa-solid fa-trash"></i>
                                        </button>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                    
                    <div class="detail-section">
                        <label>Add Checklist Item</label>
                        <div style="display: flex; gap: 8px;">
                            <input type="text" id="node-task-new-checklist" class="form-input"
                                   placeholder="New checklist item"
                                   onkeypress="if(event.key==='Enter') PPM.dynamicList.addNodeChecklistItem('${node.id}')">
                            <button class="btn-primary" onclick="PPM.dynamicList.addNodeChecklistItem('${node.id}')">
                                <i class="fa-solid fa-plus"></i>
                            </button>
                        </div>
                    </div>
                    
                    ${taskData.attachments && taskData.attachments.length > 0 ? `
                        <div class="detail-section">
                            <label>Attachments</label>
                            <div class="attachments-list">
                                ${taskData.attachments.map((att, idx) => `
                                    <div class="attachment-item">
                                        <i class="fa-solid fa-${att.type === 'link' ? 'link' : att.type === 'note' ? 'note' : 'file'}"></i>
                                        <span>${att.title || att.url || att.content}</span>
                                        <button class="btn-icon-sm" onclick="PPM.dynamicList.removeNodeAttachment('${node.id}', ${idx})">
                                            <i class="fa-solid fa-trash"></i>
                                        </button>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                    
                    <div class="detail-section">
                        <button class="btn-secondary" onclick="PPM.dynamicList.showAddAttachmentDialog('${node.id}')">
                            <i class="fa-solid fa-paperclip"></i> Add Attachment
                        </button>
                    </div>
                </div>
                
                <div class="card-detail-sidebar">
                    <div class="detail-section">
                        <label>Actions</label>
                        <button class="btn-primary btn-block" onclick="PPM.dynamicList.saveNodeTaskFromModal('${node.id}')">
                            <i class="fa-solid fa-save"></i> Save Changes
                        </button>
                        <button class="btn-danger btn-block" onclick="PPM.dynamicList.deleteNodeTask('${node.id}')">
                            <i class="fa-solid fa-trash"></i> Delete Task
                        </button>
                    </div>
                    
                    <div class="detail-section">
                        <label>Info</label>
                        <p class="text-muted" style="font-size: 0.9em;">
                            This is a standalone task in the Dynamic List, separate from board tasks.
                        </p>
                    </div>
                </div>
            </div>
        `;
    },
    
    // Save node task from modal
    saveNodeTaskFromModal: async function(nodeId) {
        try {
            const board = PPM.getCurrentBoard();
            const node = board.dynamicList.nodes.find(n => n.id === nodeId);
            
            if (!node) {
                alert('Node not found');
                return;
            }
            
            // Get values from form
            const titleEl = document.getElementById('node-task-title');
            const descEl = document.getElementById('node-task-desc');
            const priorityEl = document.getElementById('node-task-priority');
            const tagsEl = document.getElementById('node-task-tags');
            
            if (!titleEl || !descEl || !priorityEl || !tagsEl) {
                alert('Form elements not found. Please try closing and reopening the task.');
                console.error('Missing elements:', {titleEl, descEl, priorityEl, tagsEl});
                return;
            }
            
            const title = titleEl.value.trim();
            const description = descEl.value.trim();
            const priority = priorityEl.value;
            const tagsStr = tagsEl.value.trim();
            
            if (!title) {
                alert('Title is required');
                return;
            }
            
            node.title = title;
            
            if (!node.taskData) {
                node.taskData = {};
            }
            
            node.taskData.title = title;
            node.taskData.description = description || '';
            node.taskData.priority = priority || 'medium';
            node.taskData.tags = tagsStr ? tagsStr.split(',').map(t => t.trim()).filter(t => t) : [];
            node.updatedAt = new Date().toISOString();
            
            await PPM.saveBoards();
            this.render();
            
            alert('Task saved successfully!');
            console.log('Node task saved:', nodeId);
        } catch (err) {
            console.error('saveNodeTaskFromModal error:', err);
            alert('Failed to save task: ' + err.message);
        }
    },
    
    // Toggle checklist item in node task
    toggleNodeChecklistItem: async function(nodeId, index) {
        try {
            const board = PPM.getCurrentBoard();
            const node = board.dynamicList.nodes.find(n => n.id === nodeId);
            
            if (node && node.taskData && node.taskData.checklist && node.taskData.checklist[index]) {
                node.taskData.checklist[index].completed = !node.taskData.checklist[index].completed;
                await PPM.saveBoards();
                console.log(`Toggled checklist item ${index} for node ${nodeId}`);
            }
        } catch (err) {
            console.error('toggleNodeChecklistItem error:', err);
        }
    },
    
    // Add checklist item to node task
    addNodeChecklistItem: async function(nodeId) {
        try {
            const board = PPM.getCurrentBoard();
            const node = board.dynamicList.nodes.find(n => n.id === nodeId);
            const input = document.getElementById('node-task-new-checklist');
            
            if (!input) {
                console.error('Checklist input not found');
                return;
            }
            
            const text = input.value.trim();
            if (!text) {
                alert('Please enter checklist item text');
                return;
            }
            
            if (!node.taskData) node.taskData = {};
            if (!node.taskData.checklist) node.taskData.checklist = [];
            
            node.taskData.checklist.push({
                text: text,
                completed: false
            });
            
            await PPM.saveBoards();
            input.value = '';
            
            // Re-render modal to show new item
            setTimeout(() => {
                this.openTaskModal(nodeId);
            }, 100);
        } catch (err) {
            console.error('addNodeChecklistItem error:', err);
            alert('Failed to add checklist item: ' + err.message);
        }
    },
    
    // Remove checklist item from node task
    removeNodeChecklistItem: async function(nodeId, index) {
        if (!confirm('Remove this checklist item?')) return;
        
        try {
            const board = PPM.getCurrentBoard();
            const node = board.dynamicList.nodes.find(n => n.id === nodeId);
            
            if (node && node.taskData && node.taskData.checklist) {
                node.taskData.checklist.splice(index, 1);
                await PPM.saveBoards();
                
                // Re-render modal
                setTimeout(() => {
                    this.openTaskModal(nodeId);
                }, 100);
            }
        } catch (err) {
            console.error('removeNodeChecklistItem error:', err);
            alert('Failed to remove checklist item: ' + err.message);
        }
    },
    
    // Show add attachment dialog
    showAddAttachmentDialog: async function(nodeId) {
        try {
            const type = prompt('Attachment type:\n1. Link\n2. Note\n3. File\n\nEnter 1, 2, or 3:');
            
            if (!type || !['1', '2', '3'].includes(type)) return;
            
            const board = PPM.getCurrentBoard();
            const node = board.dynamicList.nodes.find(n => n.id === nodeId);
            if (!node) return;
            
            if (!node.taskData) node.taskData = {};
            if (!node.taskData.attachments) node.taskData.attachments = [];
            
            let attachment;
            
            if (type === '1') {
                const url = prompt('Enter URL:');
                if (!url) return;
                const title = prompt('Link title (optional):') || url;
                attachment = { type: 'link', url, title };
            } else if (type === '2') {
                const content = prompt('Enter note:');
                if (!content) return;
                const title = prompt('Note title (optional):') || 'Note';
                attachment = { type: 'note', content, title };
            } else {
                alert('File attachments will be available in future updates');
                return;
            }
            
            node.taskData.attachments.push(attachment);
            await PPM.saveBoards();
            
            // Re-render modal
            setTimeout(() => {
                this.openTaskModal(nodeId);
            }, 100);
        } catch (err) {
            console.error('showAddAttachmentDialog error:', err);
            alert('Failed to add attachment: ' + err.message);
        }
    },
    
    // Remove attachment from node task
    removeNodeAttachment: async function(nodeId, index) {
        if (!confirm('Remove this attachment?')) return;
        
        try {
            const board = PPM.getCurrentBoard();
            const node = board.dynamicList.nodes.find(n => n.id === nodeId);
            
            if (node && node.taskData && node.taskData.attachments) {
                node.taskData.attachments.splice(index, 1);
                await PPM.saveBoards();
                
                // Re-render modal
                setTimeout(() => {
                    this.openTaskModal(nodeId);
                }, 100);
            }
        } catch (err) {
            console.error('removeNodeAttachment error:', err);
            alert('Failed to remove attachment: ' + err.message);
        }
    },
    
    // Delete node task
    deleteNodeTask: function(nodeId) {
        if (!confirm('Delete this task and the entire node?')) return;
        
        this.deleteNode(nodeId);
        PPM.closeCardModal();
    },
    
    // Filter board by node
    filterByNode: function(nodeId) {
        const board = PPM.getCurrentBoard();
        const taskIds = new Set();
        
        // Recursively get all task IDs from this node and descendants
        const collectTasks = (nId) => {
            const node = board.dynamicList.nodes.find(n => n.id === nId);
            if (!node) return;
            
            if (node.linkedTaskIds) {
                node.linkedTaskIds.forEach(id => taskIds.add(id));
            }
            
            const children = board.dynamicList.nodes.filter(n => n.parentId === nId);
            children.forEach(child => collectTasks(child.id));
        };
        
        collectTasks(nodeId);
        
        // Apply filter to board
        this.activeFilterNodeId = nodeId;
        const cards = document.querySelectorAll('.board-card');
        
        cards.forEach(card => {
            const cardId = card.dataset.cardId;
            if (taskIds.has(cardId)) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });
        
        // Show clear filter button
        const clearBtn = document.getElementById('clear-list-filter-btn');
        clearBtn.classList.remove('hidden');
        
        // Highlight the active node
        this.render();
    },
    
    // Clear filter
    clearFilter: function() {
        this.activeFilterNodeId = null;
        
        // Show all cards
        const cards = document.querySelectorAll('.board-card');
        cards.forEach(card => {
            card.style.display = '';
        });
        
        // Hide clear filter button
        const clearBtn = document.getElementById('clear-list-filter-btn');
        clearBtn.classList.add('hidden');
        
        this.render();
    },
    
    // Show node dialog (create or add child)
    showNodeDialog: function(parentId) {
        this.currentNodeId = null;
        const dialog = document.getElementById('node-dialog-backdrop');
        const title = document.getElementById('node-dialog-title');
        const titleInput = document.getElementById('node-title');
        const typeSelect = document.getElementById('node-type');
        const parentSelect = document.getElementById('node-parent');
        const editIdInput = document.getElementById('node-edit-id');
        
        title.textContent = parentId ? 'Add Child Node' : 'Add Root Node';
        titleInput.value = '';
        typeSelect.value = 'connection';
        editIdInput.value = '';
        
        // Populate parent options
        this.populateParentOptions(parentSelect, parentId);
        
        if (parentId) {
            parentSelect.value = parentId;
            parentSelect.disabled = true;
        } else {
            parentSelect.disabled = false;
        }
        
        dialog.classList.remove('hidden');
        titleInput.focus();
    },
    
    // Edit node
    editNode: function(nodeId) {
        const board = PPM.getCurrentBoard();
        const node = board.dynamicList.nodes.find(n => n.id === nodeId);
        if (!node) return;
        
        this.currentNodeId = nodeId;
        const dialog = document.getElementById('node-dialog-backdrop');
        const title = document.getElementById('node-dialog-title');
        const titleInput = document.getElementById('node-title');
        const typeSelect = document.getElementById('node-type');
        const parentSelect = document.getElementById('node-parent');
        const editIdInput = document.getElementById('node-edit-id');
        
        title.textContent = 'Edit Node';
        titleInput.value = node.title;
        typeSelect.value = node.type;
        editIdInput.value = nodeId;
        
        this.populateParentOptions(parentSelect, node.parentId, nodeId);
        parentSelect.value = node.parentId || '';
        
        dialog.classList.remove('hidden');
        titleInput.focus();
    },
    
    // Populate parent select options
    populateParentOptions: function(select, currentParentId, excludeNodeId) {
        const board = PPM.getCurrentBoard();
        select.innerHTML = '<option value="">Root Level</option>';
        
        const addOptions = (nodes, level) => {
            for (const node of nodes) {
                if (node.id === excludeNodeId) continue; // Don't allow node to be its own parent
                
                const indent = '&nbsp;&nbsp;'.repeat(level);
                const option = document.createElement('option');
                option.value = node.id;
                option.innerHTML = `${indent}${node.title}`;
                
                // Disable if at level 9 (can't add children)
                if (level >= 9) {
                    option.disabled = true;
                }
                
                select.appendChild(option);
                
                // Add children
                const children = board.dynamicList.nodes.filter(n => n.parentId === node.id);
                if (children.length > 0) {
                    addOptions(children, level + 1);
                }
            }
        };
        
        const rootNodes = board.dynamicList.nodes.filter(n => !n.parentId && n.id !== excludeNodeId);
        addOptions(rootNodes, 0);
    },
    
    // Node type change handler
    onNodeTypeChange: function() {
        // Could add additional UI changes based on type if needed
    },
    
    // Save node (create or update)
    saveNode: async function() {
        try {
            const board = PPM.getCurrentBoard();
            if (!board) {
                alert('Board not found');
                return;
            }
            
            if (!board.dynamicList) {
                board.dynamicList = {
                    isActive: false,
                    nodes: []
                };
            }
            
            const titleEl = document.getElementById('node-title');
            const typeEl = document.getElementById('node-type');
            const parentEl = document.getElementById('node-parent');
            const editIdEl = document.getElementById('node-edit-id');
            
            if (!titleEl || !typeEl || !parentEl || !editIdEl) {
                alert('Form elements not found. Please try again.');
                console.error('Missing form elements:', {titleEl, typeEl, parentEl, editIdEl});
                return;
            }
            
            const title = titleEl.value.trim();
            const type = typeEl.value;
            const parentId = parentEl.value || null;
            const editId = editIdEl.value;
            
            if (!title) {
                alert('Please enter a title');
                return;
            }
            
            // Calculate level
            let level = 0;
            if (parentId) {
                const parent = board.dynamicList.nodes.find(n => n.id === parentId);
                if (parent) {
                    level = (parent.level || 0) + 1;
                }
            }
            
            if (level > 9) {
                alert('Maximum level depth (10) reached');
                return;
            }
            
            if (editId) {
                // Update existing node
                const node = board.dynamicList.nodes.find(n => n.id === editId);
                if (node) {
                    node.title = title;
                    node.type = type;
                    node.parentId = parentId;
                    node.level = level;
                    node.updatedAt = new Date().toISOString();
                }
            } else {
                // Create new node
                const newNode = {
                    id: `node-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
                    title: title,
                    type: type,
                    parentId: parentId,
                    level: level,
                    order: board.dynamicList.nodes.filter(n => n.parentId === parentId).length,
                    collapsed: false,
                    linkedTaskIds: [],
                    taskData: type === 'task' ? {} : null,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                
                board.dynamicList.nodes.push(newNode);
            }
            
            // Close dialog first to avoid DOM conflicts
            this.closeNodeDialog();
            
            // Save and render
            await PPM.saveBoards();
            
            // Delay render slightly to ensure DOM is ready
            setTimeout(() => {
                this.render();
            }, 50);
        } catch (err) {
            console.error('saveNode error:', err);
            alert('Failed to save node: ' + err.message);
        }
    },
    
    // Delete node
    deleteNode: async function(nodeId) {
        try {
            const board = PPM.getCurrentBoard();
            if (!board || !board.dynamicList) {
                alert('Board not found');
                return;
            }
            
            const node = board.dynamicList.nodes.find(n => n.id === nodeId);
            if (!node) {
                alert('Node not found');
                return;
            }
            
            const children = board.dynamicList.nodes.filter(n => n.parentId === nodeId);
            
            let message = `Delete "${node.title}"?`;
            if (children.length > 0) {
                message += `\n\nThis node has ${children.length} child node(s). They will also be deleted.`;
            }
            
            if (!confirm(message)) return;
            
            // Recursively delete node and all descendants
            const deleteRecursive = (nId) => {
                const descendants = board.dynamicList.nodes.filter(n => n.parentId === nId);
                descendants.forEach(d => deleteRecursive(d.id));
                board.dynamicList.nodes = board.dynamicList.nodes.filter(n => n.id !== nId);
            };
            
            deleteRecursive(nodeId);
            
            // Save and re-render
            PPM.saveBoards();
            
            // Force a complete re-render
            setTimeout(() => {
                this.render();
            }, 100);
            
            console.log('Node deleted successfully:', nodeId);
        } catch (err) {
            console.error('deleteNode error:', err);
            alert('Failed to delete node: ' + err.message);
        }
    },
    
    // Close node dialog
    closeNodeDialog: function() {
        try {
            const dialog = document.getElementById('node-dialog-backdrop');
            if (dialog) {
                dialog.classList.add('hidden');
            } else {
                console.error('Node dialog element not found');
            }
        } catch (err) {
            console.error('closeNodeDialog error:', err);
        }
    },
    
    // DEPRECATED: Task linking now done through card modal
    showTaskLinkDialog: function(nodeId) {
        alert('Task linking has been moved to the card modal.\n\nOpen any task and look for the "Dynamic List Connections" section to link it to connection nodes.');
    },
    
    // OLD VERSION - KEPT FOR REFERENCE
    _showTaskLinkDialog_old: function(nodeId) {
        /* OLD IMPLEMENTATION
        const board = PPM.getCurrentBoard();
        const node = board.dynamicList.nodes.find(n => n.id === nodeId);
        if (!node || node.type !== 'connection') return;
        
        this.currentNodeId = nodeId;
        const dialog = document.getElementById('task-link-dialog-backdrop');
        const nodeTitle = document.getElementById('link-node-title');
        const taskList = document.getElementById('task-link-list');
        
        nodeTitle.textContent = node.title;
        
        // Get all board cards (excluding reference column)
        const cards = PPM.state.cards || [];
        const boardCards = cards.filter(c => {
            const col = board.columns.find(col => col.id === c.columnId);
            return col && !col.locked;
        });
        
        // Render task list with checkboxes
        let html = '';
        for (const card of boardCards) {
            const isLinked = node.linkedTaskIds && node.linkedTaskIds.includes(card.id);
            html += `
                <div class="task-link-item">
                    <label>
                        <input type="checkbox" 
                               value="${card.id}" 
                               ${isLinked ? 'checked' : ''}
                               onchange="PPM.dynamicList.toggleTaskLink('${nodeId}', '${card.id}', this.checked)">
                        <span>${card.title}</span>
                    </label>
                </div>
            `;
        }
        
        taskList.innerHTML = html || '<p class="text-muted">No tasks available</p>';
        dialog.classList.remove('hidden');
    },
    
    // Toggle task link
    toggleTaskLink: function(nodeId, taskId, checked) {
        const board = PPM.getCurrentBoard();
        const node = board.dynamicList.nodes.find(n => n.id === nodeId);
        if (!node) return;
        
        if (!node.linkedTaskIds) {
            node.linkedTaskIds = [];
        }
        
        if (checked) {
            if (!node.linkedTaskIds.includes(taskId)) {
                node.linkedTaskIds.push(taskId);
            }
        } else {
            node.linkedTaskIds = node.linkedTaskIds.filter(id => id !== taskId);
        }
        
        PPM.saveBoards();
        this.render(); // Update task counts
        */
    },
    
    // DEPRECATED: Task linking now done through card modal
    closeTaskLinkDialog: function() {
        const dialog = document.getElementById('task-link-dialog-backdrop');
        if (dialog) {
            dialog.classList.add('hidden');
        }
    }
};

