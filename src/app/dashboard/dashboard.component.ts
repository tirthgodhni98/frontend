import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Task, TaskBoard } from '../../models/task.model';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DragDropModule } from 'primeng/dragdrop';
import { v4 as uuidv4 } from 'uuid';
import { TaskService } from '../services/task.service';
import { HttpClientModule } from '@angular/common/http';
import { ProfileComponent } from '../components/profile/profile.component';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { AvatarModule } from 'primeng/avatar';
import { TooltipModule } from 'primeng/tooltip';

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
    DragDropModule, 
    HttpClientModule,
    DynamicDialogModule,
    AvatarModule,
    ProfileComponent,
    TooltipModule
  ],
  providers: [DialogService],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  user: any;

  boards: TaskBoard[] = [];
  newBoardName = '';
  newTaskTitle = '';
  selectedBoardId = '';
  displayBoardDialog = false;
  displayTaskDialog = false;
  displayProfileDialog = false;
  dialogRef: DynamicDialogRef | undefined;

  constructor(
    private taskService: TaskService,
    private dialogService: DialogService
  ) {}

  ngOnInit() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      this.user = JSON.parse(userStr);
    }
    this.loadTaskBoards();
  }

  loadTaskBoards() {
    this.taskService.getTaskBoards().subscribe(
      (boards) => {
        this.boards = boards;
        console.log(this.boards);
      },
      (error) => {
        console.error('Error fetching task boards:', error);
      }
    );
  }

  openBoardDialog() {
    this.newBoardName = '';
    this.displayBoardDialog = true;
  }

  addBoard() {
    if (this.newBoardName.trim()) {
      const newBoard: TaskBoard = { id: uuidv4(), name: this.newBoardName, tasks: [] };
      this.taskService.addTaskBoard(newBoard).subscribe(
        (board) => {
          this.boards.push(board);
          this.displayBoardDialog = false;
        },
        (error) => {
          console.error('Error adding task board:', error);
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
    const board = this.boards.find(b => b.id === this.selectedBoardId);
    const userId = this.user?.id;
    console.log({board, userId});
  
    if (board && this.newTaskTitle.trim() && userId) {
      const newTask: { title: string; boardId: string; userId: string } = {
        title: this.newTaskTitle,
        boardId: board.id,
        userId
      };
  
      this.taskService.addTask(newTask).subscribe(
        (task) => {
          board.tasks.push(task);
          this.displayTaskDialog = false;
        },
        (error) => {
          console.error("Error adding task:", error);
        }
      );
    }
  }
  
  deleteBoard(boardId: string) {
    this.taskService.deleteTaskBoard(boardId).subscribe(
      () => {
        this.boards = this.boards.filter(board => board.id !== boardId);
        this.displayBoardDialog = false;
      },
      (error) => {
        console.error('Error deleting task board:', error);
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
      },
      (error) => {
        console.error('Error deleting task:', error);
      }
    );
  }
  
  onTaskDrop(event: any, targetBoardId: string) {
    const draggedTask: Task = event.dragData;
    const sourceBoard = this.boards.find(board => board.tasks.some(task => task.id === draggedTask.id));
    const targetBoard = this.boards.find(board => board.id === targetBoardId);

    if (sourceBoard && targetBoard && sourceBoard !== targetBoard) {
      sourceBoard.tasks = sourceBoard.tasks.filter(task => task.id !== draggedTask.id);
      targetBoard.tasks.push(draggedTask);
    }
  }

  openProfileDialog() {
    this.dialogRef = this.dialogService.open(ProfileComponent, {
      header: 'My Profile',
      width: '500px',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000
    });

    this.dialogRef.onClose.subscribe(() => {
    });
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
}