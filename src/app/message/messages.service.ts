import {Message} from './message.model';
import {Subject} from 'rxjs/Subject';
import {User} from '../user/user.model';
import {Thread} from '../thread/thread.model';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/scan';
import 'rxjs/add/operator/publishReplay';
import 'rxjs/add/operator/map';

const initialMessages: Message[] = [];

type IMessagesOperation = (messages: Message[]) => Message[];

export class MessagesService {
  newMessages: Subject<Message> = new Subject<Message>();
  messages: Observable<Message[]>;
  // updates receives operationsto be applied to our messages
  // so we can perform changes on all messages that are currently stored in messages
  updates: Subject<any> = new Subject<any>();
  // action streams
  create: Subject<Message> = new Subject<Message>();
  markThreadAsRead: Subject<any> = new Subject<any>();
  constructor() {
    this.messages = this.updates
      .scan((messages: Message[],
             operation: IMessagesOperation) => {
          return operation(messages);
        },
        initialMessages)
      .publishReplay(1)
      .refCount();

    this.create // emit a function which accepts the list of messages and adds this message to our list of messages
      .map(function (message: Message): IMessagesOperation {
        return (messages: Message[]) => { // map calls function on each element in array and emits return value
          return messages.concat(message);
        };
      })
      .subscribe(this.updates); // subscribe updates stream to listen to create stream
    // if create receives a message, it emits an IMessagesOperation that is received by updates and the Message is added to messsages

    this.newMessages
      .subscribe(this.create);

    this.markThreadAsRead
      .map((thread: Thread) => {
        return (messages: Message[]) => {
          return messages.map((message: Message) => {
            if (message.thread.id === thread.id) {
              message.isRead = true;
            }
            return message;
          });
        };
      })
      .subscribe(this.updates);
  }

  public addMessage(message: Message): void {
    this.newMessages.next(message);
  }

  // return stream of everyone else's messages in the thread
  public messagesForThreadUser(thread: Thread, user: User): Observable<Message> {
    return this.newMessages
      .filter((message: Message) => {
        return (message.thread.id === thread.id) && (message.author.id !== user.id);
      });
  }
}

export const messagesServiceInjectables: Array<any> = [
  MessagesService
];
