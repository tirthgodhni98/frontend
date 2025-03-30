import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Task, TaskBoard } from '../../models/task.model';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { v4 as uuidv4 } from 'uuid';
import { TaskService } from '../services/task.service';
import { HttpClientModule } from '@angular/common/http';
import { ProfileComponent } from '../components/profile/profile.component';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { AvatarModule } from 'primeng/avatar';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    FormsModule, 
    ButtonModule, 
    DialogModule, 
    InputTextModule, 
    HttpClientModule,
    DynamicDialogModule,
    AvatarModule,
    TooltipModule,
    ToastModule
  ],
  providers: [DialogService, MessageService],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, AfterViewInit {
  user: any;

  boards: TaskBoard[] = [];
  newBoardName = '';
  newTaskTitle = '';
  selectedBoardId = '';
  displayBoardDialog = false;
  displayTaskDialog = false;
  draggedTaskId: string | null = null;
  activeDropTarget: Element | null = null;
  dialogRef: DynamicDialogRef | undefined;

  constructor(
    private taskService: TaskService,
    private dialogService: DialogService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      this.user = JSON.parse(userStr);
    }
    this.loadTaskBoards();
  }

  ngAfterViewInit() {
    this.setupDragAndDrop();
  }

  setupDragAndDrop() {
    setTimeout(() => {
      const taskElements = document.querySelectorAll('.task');
      const boardElements = document.querySelectorAll('.task-list');

      taskElements.forEach(taskElement => {
        taskElement.setAttribute('draggable', 'true');
        
        taskElement.addEventListener('dragstart', (event: any) => {
          const target = event.target.closest('.task');
          if (!target) return;
          
          this.draggedTaskId = this.findTaskIdFromElement(target);
          target.classList.add('dragging');
        });
        
        taskElement.addEventListener('dragend', () => {
          taskElement.classList.remove('dragging');
          this.draggedTaskId = null;
          
          if (this.activeDropTarget) {
            this.activeDropTarget.classList.remove('drop-active');
            this.activeDropTarget = null;
          }
        });
      });
      
      boardElements.forEach(boardElement => {
        boardElement.addEventListener('dragover', (event: any) => {
          event.preventDefault();
        });
        
        boardElement.addEventListener('dragenter', (event: any) => {
          event.preventDefault();
          if (this.activeDropTarget) {
            this.activeDropTarget.classList.remove('drop-active');
          }
          
          boardElement.classList.add('drop-active');
          this.activeDropTarget = boardElement;
        });
        
        boardElement.addEventListener('dragleave', (event: any) => {
          if (!boardElement.contains(event.relatedTarget)) {
            boardElement.classList.remove('drop-active');
            if (this.activeDropTarget === boardElement) {
              this.activeDropTarget = null;
            }
          }
        });
        
        boardElement.addEventListener('drop', (event: any) => {
          event.preventDefault();
          boardElement.classList.remove('drop-active');
          this.activeDropTarget = null;
          
          if (!this.draggedTaskId) return;
          
          const targetBoardId = boardElement.getAttribute('data-board-id');
          if (!targetBoardId) return;
          
          this.handleTaskMove(this.draggedTaskId, targetBoardId);
        });
      });
    }, 100);
  }
  
  findTaskIdFromElement(element: Element): string | null {
    const taskElements = Array.from(document.querySelectorAll('.task'));
    const index = taskElements.indexOf(element);
    
    if (index !== -1) {
      let taskCount = 0;
      for (const board of this.boards) {
        if (board.tasks) {
          for (const task of board.tasks) {
            if (taskCount === index) {
              return task.id;
            }
            taskCount++;
          }
        }
      }
    }
    
    return null;
  }
  
  handleTaskMove(taskId: string, targetBoardId: string) {
    let sourceBoard: TaskBoard | undefined;
    let draggedTask: Task | undefined;
    
    for (const board of this.boards) {
      if (board.tasks) {
        const task = board.tasks.find(t => t.id === taskId);
        if (task) {
          sourceBoard = board;
          draggedTask = task;
          break;
        }
      }
    }
    
    const targetBoard = this.boards.find(board => board.id === targetBoardId);
    
    if (sourceBoard && targetBoard && draggedTask && sourceBoard.id !== targetBoard.id) {
      const taskIndex = sourceBoard.tasks.findIndex(task => task.id === taskId);
      const taskToMove = sourceBoard.tasks[taskIndex];
      sourceBoard.tasks.splice(taskIndex, 1);
      
      if (!targetBoard.tasks) {
        targetBoard.tasks = [];
      }
      targetBoard.tasks.push(taskToMove);
      
      this.taskService.moveTask(taskId, targetBoardId).subscribe(
        (updatedTask) => {
          const taskIdx = targetBoard.tasks.findIndex(t => t.id === updatedTask.id);
          if (taskIdx !== -1) {
            targetBoard.tasks[taskIdx] = updatedTask;
          }
          
          this.messageService.add({
            severity: 'success',
            summary: 'Task Moved',
            detail: `Task "${updatedTask.title}" moved successfully`
          });
          
          this.setupDragAndDrop();
        },
        (error) => {
          console.error('Error moving task:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to move task'
          });
          
          this.loadTaskBoards();
        }
      );
    }
  }

  loadTaskBoards() {
    this.taskService.getTaskBoards().subscribe(
      (boards) => {
        this.boards = boards;
        setTimeout(() => this.setupDragAndDrop(), 100);
      },
      (error) => {
        console.error('Error fetching task boards:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load task boards'
        });
      }
    );
  }

  openBoardDialog() {
    this.newBoardName = '';
    this.displayBoardDialog = true;
  }

  addBoard() {
    if (this.newBoardName.trim()) {
      const newBoard: Partial<TaskBoard> = { name: this.newBoardName };
      this.taskService.addTaskBoard(newBoard).subscribe(
        (board) => {
          this.boards.push(board);
          this.displayBoardDialog = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Board Created',
            detail: `Board "${board.name}" created successfully`
          });
          
          setTimeout(() => this.setupDragAndDrop(), 100);
        },
        (error) => {
          console.error('Error adding task board:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to create board'
          });
        }
      );
    }
  }

  openTaskDialog(boardId: string) {
    this.selectedBoardId = boardId;
    this.newTaskTitle = '';
    this.displayTaskDialog = true;
  }

  addTask() {
    if (this.selectedBoardId && this.newTaskTitle.trim()) {
      const taskData = {
        title: this.newTaskTitle,
        boardId: this.selectedBoardId
      };
      
      this.taskService.addTask(taskData).subscribe(
        (task) => {
          const board = this.boards.find(b => b.id === this.selectedBoardId);
          if (board) {
            if (!board.tasks) {
              board.tasks = [];
            }
            board.tasks.push(task);
          }
          this.displayTaskDialog = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Task Added',
            detail: `Task "${task.title}" added successfully`
          });
          
          setTimeout(() => this.setupDragAndDrop(), 100);
        },
        (error) => {
          console.error("Error adding task:", error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to add task'
          });
        }
      );
    }
  }
  
  deleteBoard(boardId: string) {
    this.taskService.deleteTaskBoard(boardId).subscribe(
      () => {
        this.boards = this.boards.filter(board => board.id !== boardId);
        this.messageService.add({
          severity: 'success',
          summary: 'Board Deleted',
          detail: 'Board deleted successfully'
        });
      },
      (error) => {
        console.error('Error deleting task board:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to delete board'
        });
      }
    );
  }
  
  deleteTask(boardId: string, taskId: string) {
    this.taskService.deleteTask(taskId).subscribe(
      () => {
        const board = this.boards.find(b => b.id === boardId);
        if (board) {
          board.tasks = board.tasks.filter(t => t.id !== taskId);
        }
        this.messageService.add({
          severity: 'success',
          summary: 'Task Deleted',
          detail: 'Task deleted successfully'
        });
      },
      (error) => {
        console.error('Error deleting task:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to delete task'
        });
      }
    );
  }

  openProfileDialog() {
    this.dialogRef = this.dialogService.open(ProfileComponent, {
      header: 'My Profile',
      width: '500px',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000
    });
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
}