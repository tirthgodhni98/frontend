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

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ButtonModule, DialogModule, InputTextModule, DragDropModule, DragDropModule],
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


  ngOnInit() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      this.user = JSON.parse(userStr);
    }
  }


  openBoardDialog() {
    this.newBoardName = '';
    this.displayBoardDialog = true;
  }

  addBoard() {
    if (this.newBoardName.trim()) {
      this.boards.push({ id: uuidv4(), name: this.newBoardName, tasks: [] });
      this.displayBoardDialog = false;
    }
  }

  openTaskDialog(boardId: string) {
    this.selectedBoardId = boardId;
    this.newTaskTitle = '';
    this.displayTaskDialog = true;
  }

  addTask() {
    const board = this.boards.find(b => b.id === this.selectedBoardId);
    if (board && this.newTaskTitle.trim()) {
      board.tasks.push({ id: uuidv4(), title: this.newTaskTitle });
      this.displayTaskDialog = false;
    }
  }

  deleteBoard(boardId: string) {
    this.boards = this.boards.filter(b => b.id !== boardId);
  }

  deleteTask(boardId: string, taskId: string) {
    const board = this.boards.find(b => b.id === boardId);
    if (board) {
      board.tasks = board.tasks.filter(t => t.id !== taskId);
    }
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

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
} 