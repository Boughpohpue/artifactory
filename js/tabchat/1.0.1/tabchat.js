/* ================================================================================== */
/* >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>     TABCHAT.JS     <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< */
/* ================================================================================== */
import { nameof, Is, Gimme, Otis } from 'https://boughpohpue.github.io/artifactory/js/just/1.0.1/just.js';

/* >>>---> tabchat_message.js >-----------------------------------------------------> */
export class TabchatMessage {
  subject;
  message;
  room;
  sender;
  recipient;
  timestamp;

  constructor(subject, message, room = null, sender = null, recipient = null, timestamp = null) {
    this.subject = subject;
    this.message = message;
    this.room = room;
    this.sender = sender;
    this.recipient = recipient;
    this.timestamp = !!timestamp ? timestamp : Gimme.currentTime;
  }

  update() {
    this.timestamp = Gimme.currentTime;
  }

  static create(content, room) {
    return new TabchatMessage("untitled", content, room);
  }
  static parse(data) {
    if (!data) return null;

    if (typeof data === "string") {
      try {
        const msg = JSON.parse(data);
        data = msg;
      } catch (e) {
        data = { message: data };
      }
    }

    if (TabchatMessage.isThorough(data)) {
      return new TabchatMessage(data.subject, data.message, data.room, data.sender, data.recipient, data.timestamp);
    } else if (TabchatMessage.isValid(data)) {
      return new TabchatMessage(
        !!data.subject ? data.subject : "untitled",
        data.message,
        !!data.room ? data.room : undefined,
        !!data.sender ? data.sender : undefined,
        !!data.recipient ? data.recipient : undefined,
        !!data.timestamp ? data.timestamp : undefined
      );
    } else {
      return new TabchatMessage("untitled", JSON.stringify(data));
    }
  }

  static isValid(data) {
    return !!data.message;
  }
  static isThorough(data) {
    return TabchatMessage.isValid(data) && !!data.subject && !!data.room && !!data.sender && !!data.recipient;
  }
  static isPublic(data) {
    return data.recipient === "all";
  }
  static isPing(data) {
    return data.subject === "handshake" && data.message === "ping";
  }
  static isPong(data) {
    return data.subject === "handshake" && data.message === "pong";
  }
}
/* <-----------------------------------------------------< tabchat_message.js <---<<< */

/* >>>---> tabchat_room.js >--------------------------------------------------------> */
export class TabchatRoom {
  static isValidName(name) {
    return !!name && name.length > 0;
  }
  static isValidHandler(handler) {
    return Is.thisFunction(handler);
  }

  _room = null;
  _onmessage = undefined;

  get isOpen() {
    return !!this._room;
  }
  get roomName() {
    return this._room ? this._room.name : "N/A";
  }

  constructor(name, handler = undefined) {
    try {
      if (!TabchatRoom.isValidName(name)) {
        throw new Error("Invalid room name!");
      }
      if (handler !== undefined && !TabchatRoom.isValidHandler(handler)) {
        throw new Error("Handler must be a function!");
      }
      this._room = new BroadcastChannel(name);
      this._room.onmessage = this.onEcho.bind(this);
      this.adjust(handler);
    } catch (e) {
      Otis.log(e, `${TabchatRoom.name}.constructor`);
      throw e;
    }
  }

  adjust(handler) {
    if (this._onmessage || !TabchatRoom.isValidHandler(handler)) {
      return false;
    }
    this._onmessage = handler;
    return true;
  }
  close() {
    if (!this.isOpen) {
      return false;
    }
    this._room.close();
    this._room = null;
    return true;
  }
  echo(data) {
    if (!this.isOpen || !data) {
      return false;
    }

    if (data instanceof TabchatMessage) data.update();
    else data = new TabchatMessage("untitled", data, this.roomName);

    this._room.postMessage(data);
    return true;
  }
  onEcho(event) {
    if (this._onmessage) {
      this._onmessage(event);
    }
  }
}
/* <--------------------------------------------------------< tabchat_room.js <---<<< */

/* >>>---> tabchat_hub.js >---------------------------------------------------------> */
export class TabchatHub {
  static get _debug() {
    return true;
  }
  static get _roomName() {
    return `${TabchatHub.name}-internal`;
  }
  static get _pingPongContinues() {
    return TabchatHub._infinitePingPong;
  }

  static _id;
  static _rooms;
  static _innerSpace;
  static _participants;
  static _infinitePingPong;

  static get id() {
    return TabchatHub._id;
  }

  static init(infinitePingPong = true) {
    if (TabchatHub._initialized) {
      return;
    }
    if (!Is.thisBoolean(infinitePingPong)) {
      infinitePingPong = false;
    }

    TabchatHub._id = Gimme.randomUuid;
    TabchatHub._rooms = [];
    TabchatHub._participants = [];
    TabchatHub._innerSpace = new TabchatRoom(TabchatHub._roomName, TabchatHub._onInnerTremble.bind(this));
    TabchatHub._infinitePingPong = infinitePingPong;
    TabchatHub._initialized = true;
    Otis.log("Init complete.", `${TabchatHub.name}.${nameof(TabchatHub.init)}`);
    Otis.log("Arranging handshakes...", `${TabchatHub.name}.${nameof(TabchatHub.init)}`);
    TabchatHub._innerTremble("handshake", "ping", "all");
  }

  static addRoom(name) {
    try {
      if (!TabchatRoom.isValidName(name)) {
        throw new Error("Provided room name is invalid!");
      }
      if (TabchatHub._rooms.some((c) => c.roomName == name)) {
        throw new Error(`Room #${name} already exists!`);
      }
      TabchatHub._rooms.push(new TabchatRoom(name));
      Otis.log(`Room #${name} has been added.`, `${TabchatHub.name}.${nameof(TabchatHub.addRoom)}`);
    } catch (e) {
      Otis.log(e, `${TabchatHub.name}.${nameof(TabchatHub.addRoom)}`);
      return false;
    }
    return true;
  }
  static getRoom(name) {
    if (!TabchatRoom.isValidName(name)) {
      return null;
    }
    return TabchatHub._rooms.find((c) => c.roomName === name);
  }
  static adjustRoom(name, handler) {
    const room = TabchatHub.getRoom(name);
    if (!room) {
      return false;
    }
    Otis.log(`[${TabchatHub._id}] Adjusting #${name} ...`, `${TabchatHub.name}.${nameof(TabchatHub.adjustRoom)}`);
    return room.adjust(handler);
  }
  static echo(message) {
    if (!message || !(message instanceof TabchatMessage)) {
      return false;
    }
    const room = TabchatHub.getRoom(message.room);
    if (!room) {
      return false;
    }
    if (TabchatHub._debug) {
      Otis.log(`Echoing in room #${room.roomName} ...`, `${TabchatHub.name}.${nameof(TabchatHub.echo)}`);
    }
    return room.echo(message);
  }
  static echoInRoom(name, message) {
    const room = TabchatHub.getRoom(name);
    if (!room) {
      return false;
    }
    if (TabchatHub._debug) {
      Otis.log(`Echoing in room #${name} ...`, `${TabchatHub.name}.${nameof(TabchatHub.echoInRoom)}`);
    }
    return room.echo(message);
  }
  static closeRoom(name, notify = true) {
    const room = TabchatHub.getRoom(name);
    if (!room) {
      return false;
    }

    if (notify) {
      TabchatHub._innerTremble("closing_room", name, "all");
      room.echo(new TabchatMessage("admin", "closing room"));
    }

    setTimeout(() => {
      room.close();
      TabchatHub._rooms = TabchatHub._rooms.filter((c) => c.roomName != name);
      Otis.log(`Room #${name} has been closed!`, `${TabchatHub.name}.${nameof(TabchatHub.closeRoom)}`);
    }, 3693);

    return true;
  }
  static _innerTremble(subject, message, recipient) {
    Otis.log(`Sending ${subject}.${message} to ${recipient}`, `${TabchatHub.name}.${nameof(TabchatHub._innerTremble)}`);
    TabchatHub._innerSpace.echo(new TabchatMessage(subject, message, TabchatHub._roomName, TabchatHub.id, recipient));
  }
  static _onInnerTremble(event) {
    const data = event.data;
    if (!TabchatMessage.isThorough(data)) {
      return false;
    }
    if (TabchatMessage.isPublic(data)) {
      if (TabchatMessage.isPing(data)) {
        Otis.log(
          `Received ${data.subject}.${data.message} from ${data.sender}`,
          `${TabchatHub.name}.${nameof(TabchatHub._onInnerTremble)}`
        );
        if (!TabchatHub._isKnownSender(data.sender)) {
          TabchatHub._participants.push(data.sender);
        }
        TabchatHub._innerTremble("handshake", "pong", data.sender);
        return true;
      }

      if (data.subject == "closing_room" && TabchatHub._isKnownSender(data.sender)) {
        return TabchatHub.closeRoom(data.message, false);
      }
    } else if (TabchatHub._isValidRecipient(data)) {
      if (TabchatMessage.isPing(data) && TabchatHub._pingPongContinues) {
        setTimeout(() => {
          Otis.log(
            `Received ${data.subject}.${data.message} from ${data.sender}`,
            `${TabchatHub.name}.${nameof(TabchatHub._onInnerTremble)}`
          );
          TabchatHub._innerTremble("handshake", "pong", data.sender);
        }, Math.random() * (3963 - 369) + 369);
        return true;
      }
      if (TabchatMessage.isPong(data)) {
        if (!TabchatHub._isKnownSender(data.sender)) {
          Otis.log(
            `Received ${data.subject}.${data.message} from ${data.sender}`,
            `${TabchatHub.name}.${nameof(TabchatHub._onInnerTremble)}`
          );
          TabchatHub._participants.push(data.sender);

          if (TabchatHub._pingPongContinues) {
            TabchatHub._innerTremble("handshake", "ping", data.sender);
          }
        } else if (TabchatHub._pingPongContinues) {
          setTimeout(() => {
            Otis.log(
              `Received ${data.subject}.${data.message} from ${data.sender}`,
              `${TabchatHub.name}.${nameof(TabchatHub._onInnerTremble)}`
            );
            TabchatHub._innerTremble("handshake", "ping", data.sender);
          }, Math.random() * (3963 - 369) + 369);
        }
        return true;
      }
    }
    return false;
  }
  static _isValidRecipient(data) {
    return data.recipient === TabchatHub.id;
  }
  static _isKnownSender(sender) {
    return TabchatHub._participants.includes(sender);
  }
}
/* <---------------------------------------------------------< tabchat_hub.js <---<<< */

export default TabchatHub;

/* ================================================================================== */
/* >>>>>>>>>>>>>>>>>>>>>>>>>>>>    END OF: TABCHAT.JS    <<<<<<<<<<<<<<<<<<<<<<<<<<<< */
/* ================================================================================== */
