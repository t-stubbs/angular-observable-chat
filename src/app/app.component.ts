import { Component } from '@angular/core';
import {MessagesService} from './message/messages.service';
import {UsersService} from './user/users.service';
import {ThreadsService} from './thread/threads.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(public messagesService: MessagesService,
              public threadsService: ThreadsService,
              public usersService: UsersService) {
  }
}
