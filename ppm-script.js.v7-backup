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
        backlogFilter: null // Filter cards by backlog item ID
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
            const res = await fetch(`ppm-boards.json?t=${Date.now()}`);
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
            const res = await fetch(`ppm-users.json?t=${Date.now()}`);
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
    const createBoard = (name, description, sourceData = null) => {
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
            columns: createDefaultColumns(),
            cards: [],
            labels: [],
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

    const createDefaultColumns = () => {
        return [
            { id: generateId('col'), name: 'Backlog', order: 0, limit: null, color: '#6c757d' },
            { id: generateId('col'), name: 'To Do', order: 1, limit: null, color: '#0d6efd' },
            { id: generateId('col'), name: 'In Progress', order: 2, limit: 5, color: '#0dcaf0' },
            { id: generateId('col'), name: 'Review', order: 3, limit: null, color: '#ffc107' },
            { id: generateId('col'), name: 'Done', order: 4, limit: null, color: '#198754' }
        ];
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
        
        // Render columns
        renderColumns(board);
        
        // Update backlog filter banner
        updateBacklogFilterBanner();
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
        
        return `
            <div class="board-column" data-column-id="${column.id}">
                <div class="column-header">
                    <h3 class="column-title">${column.name}</h3>
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
        
        // Get the backlog column ID (first column)
        const backlogColumnId = board.columns[0]?.id;
        const isBacklogCard = card.columnId === backlogColumnId;
        
        return `
            <div class="card ${isBacklogCard ? 'backlog-card' : ''}" 
                 draggable="true" 
                 data-card-id="${card.id}"
                 onclick="PPM.ui.openCardDetail('${card.id}')">
                ${isBacklogCard ? `
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
                <h4 class="card-title">${card.title}</h4>
                ${card.description ? `<p class="card-description">${card.description.substring(0, 100)}${card.description.length > 100 ? '...' : ''}</p>` : ''}
                
                ${isBacklogCard && card.attachments.length > 0 ? `
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
                    ${!isBacklogCard && card.attachments.length > 0 ? `<span class="card-attachments"><i class="fa-solid fa-paperclip"></i> ${card.attachments.length}</span>` : ''}
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
        state.draggedCard = e.target.dataset.cardId;
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
        openAddCardModal: (columnId) => {
            const board = getCurrentBoard();
            const column = getColumnById(board, columnId);
            
            // Get backlog items for linking (if not adding to backlog)
            const backlogColumnId = board.columns[0]?.id;
            const backlogCards = columnId !== backlogColumnId ? getCardsByColumn(board, backlogColumnId) : [];
            
            openModal(`Add Task to ${column.name}`, `
                <form id="add-card-form" class="modal-form">
                    <label for="card-title">Task Title *</label>
                    <input type="text" id="card-title" required autofocus>
                    
                    <label for="card-description">Description</label>
                    <textarea id="card-description" rows="3"></textarea>
                    
                    ${backlogCards.length > 0 ? `
                        <label>Link to Backlog Items (optional)</label>
                        <div class="backlog-selector">
                            ${backlogCards.map(bc => `
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
                        <textarea id="card-desc-edit" rows="4">${card.description || ''}</textarea>
                    </div>
                    
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
            const name = prompt('Board name:');
            if (name && name.trim()) {
                const board = createBoard(name.trim(), '');
                saveBoards();
                window.location.href = `board.html?id=${board.id}`;
            }
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
        convertControlToBoard,
        saveBoards,
        createBoard,
        getCurrentBoard
    };
})();

// Make PPM available globally
window.PPM = PPM;
