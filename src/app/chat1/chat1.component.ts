import {
  AfterContentChecked,
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  OnInit,
  Output,
  QueryList,
  viewChild,
  ViewChild,
  ViewChildren,
  ViewEncapsulation,
} from '@angular/core';
import { Location } from '@angular/common';
import {
  ActionSheetController,
  AnimationController,
  Gesture,
  GestureController,
  IonContent,
  IonInput,
  MenuController,
  PopoverController,
  ToastController,
} from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { EchoService } from '../echo.service';
import { debounceTime, Observable, Subject } from 'rxjs';
import { SharedService } from '../shared.service';

@Component({
  selector: 'app-chat1',
  templateUrl: './chat1.component.html',
  styleUrls: ['./chat1.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class Chat1Component implements OnInit {
  @Output() scrollToTop = new EventEmitter<void>();
  @ViewChild('chat_preview') chat_preview;
  @ViewChild('groupInfoModal') groupInfoModal;
  @ViewChild('addMember') addMember;
  @ViewChild('chat_previewIon_content', { static: false }) content: IonContent;
  @ViewChild('chat_list_content', { static: false })
  chat_list_content: IonContent;
  selectedMessageId = [];
  isAtBottom: boolean = false;
  currentMatchIndex: number = -1;
  matchedIndexes: number[] = [];
  searchVisible = false;
  searchAnimationClass = '';
  isGroupAdmin;
  isMember = true;
  isAdmin = false;
  isreceiver = false;
  isLoading = false;

  activeDateLabel = 'asdhj';

  gpMemberSearchedName;
  gpMembers1;
  gpMembers;

  isOnetoOneChatSearch = false;
  oneToOneSearchName;

  deleteGroupMember = {
    senderid: localStorage.getItem('UserId'),
    memberid: '',
    groupid: '',
    actiontype: '',
  };
  isAtTop: boolean;
  get isNewGroupCreationType() {
    return typeof this.filterParams.isnewGroupCreation;
  }
  chatFilterSelectedValue = 'all';
  chatSearchedName = '';
  localStorage = localStorage;
  showSpinner = false;
  allChats;
  allChats1;
  one2oneChats = [];
  message = '';
  selectedChat;
  filterParams = {
    one2oneChats: '',
    isnewGroupCreation: '',
    isGroupNaming: '',
  };
  selectedUsers = []; //to store selected users to create group
  isGroupNaming = false;
  createNewGroup = {
    loginid: localStorage.getItem('UserId'),
    chattype: 'gct',
    members: '',
    groupname: '',
  };
  executivesList;
  copyOfExecutivesList;
  isOnCallDetailsPage = false;

  isForwardMsg = false;
  public searchchatTrigger$ = new Subject<void>();

  constructor(
    private toastController: ToastController,
    private _echoService: EchoService,
    private popoverController: PopoverController,
    private location: Location,
    private menuCtrl: MenuController,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private activeRoute: ActivatedRoute,
    private animationCtrl: AnimationController,
    private sharedService: SharedService,
    private gestureCtrl: GestureController
  ) {
    this.showSpinner = true;
    this.getAllChats();
  }
  isGroupNameEditing: boolean = false;
  ngOnInit() {
    this.activeRoute.queryParams.subscribe((params) => {
      if (params['isOnCallDetailsPage'] == 'true') {
        this.isOnCallDetailsPage = true;
      } else {
        this.isOnCallDetailsPage = false;
      }
      this.localStorage.removeItem('selectedChat');
      this.isAdmin =
        localStorage.getItem('Role') === '1' &&
        !localStorage.getItem('ranavPropId');
      this.isOnetoOneChatSearch = false;
      this.chatFilterSelectedValue = 'all';
      if (
        params['isnewGroupCreation'] == 'true' &&
        params['isGroupNaming'] == 'true'
      ) {
        this.filterParams.isGroupNaming = 'true';
        this.filterParams.isnewGroupCreation = 'false';
      } else if (params['isnewGroupCreation'] == 'true') {
        this.filterParams.isGroupNaming = 'false';
        this.filterParams.isnewGroupCreation = 'true';
      } else if (params['isGroupNaming'] == 'true') {
        this.filterParams.isGroupNaming = 'true';
        this.filterParams.isnewGroupCreation = 'false';
      } else {
        this.filterParams.isGroupNaming = 'false';
        this.filterParams.isnewGroupCreation = 'false';
      }

      this.searchchatTrigger$.pipe(debounceTime(1000)).subscribe(() => {
        // if (this.isApiCallPending == false) {
        this.onChatSearch();
        // }
      });

      this._echoService.listenToChannel(
        'database-changes',
        '.DatabaseNotification',
        (data) => {
          const selectedChat = localStorage.getItem('selectedChat');

          this.selectedChat = selectedChat ? JSON.parse(selectedChat) : null;
          if (!this.one2oneChats) {
            this.one2oneChats = [];
          }

          const messagesArray = data[1];
          if (this.edit_text) {
            this.one2oneChats = messagesArray.map((m) => {
              if (m.item_id === this.edit_text?.[0]?.item_id) {
                return { ...m, m };
              } else {
                return m;
              }
            });
            this.onEdit_msg_back();
          }

          if (Array.isArray(messagesArray) && messagesArray.length > 0) {
            let lastMessage;
            if (messagesArray.length > 1) {
              let chatdata;
              if (
                this.selectedChat &&
                this.selectedChat.chat_type == 'individual'
              ) {
                chatdata = this.allChats?.filter((chat) => {
                  return (
                    chat.executives_IDPK == this.selectedChat.executives_IDPK
                  );
                });
                this.selectedChat = chatdata[0];
              } else if (
                this.selectedChat &&
                this.selectedChat.chat_type == 'group'
              ) {
                chatdata = this.allChats?.filter((chat) => {
                  return chat.chat_id == this.selectedChat.chat_id;
                });
                this.selectedChat = chatdata[0];
              }
              lastMessage = messagesArray[messagesArray.length - 1];
            } else if (messagesArray.length == 1) {
              lastMessage = messagesArray[0];
            }

            let alreadyExists;
            if (this.one2oneChats) {
              alreadyExists = this.one2oneChats.some(
                (msg) => msg.item_id === lastMessage.item_id
              );
            }

            if (!alreadyExists) {
              if (lastMessage.chat_id == this.selectedChat?.chat_id) {
                this.one2oneChats = this.one2oneChats.filter((item) => {
                  return item.item_id != '';
                });
                this.one2oneChats.push(lastMessage);
                setTimeout(() => {
                  this.updatedAsMessageRead(this.selectedChat?.chat_id);
                }, 0);
              } else if (messagesArray.length == 1) {
                this.getChatListForFreshChat().subscribe((exec) => {
                  this.executivesList = exec.details;
                  this.copyOfExecutivesList = exec['details'];

                  let executives = this.executivesList.filter((chat) => {
                    return (
                      chat.executives_IDPK ==
                      (this.selectedChat.chat_type == 'individual'
                        ? this.selectedChat.executives_IDPK
                        : this.selectedChat.chat_id)
                    );
                  });
                  this.selectedChat = executives[0];

                  if (lastMessage.chat_id == executives[0]?.chat_id) {
                    this.one2oneChats = this.one2oneChats.filter((item) => {
                      return item.item_id != '';
                    });
                    this.one2oneChats.push(lastMessage);
                    setTimeout(() => {
                      this.updatedAsMessageRead(this.selectedChat.chat_id);
                    }, 0);
                  }
                });
              }
              if (
                messagesArray.length > 1 &&
                (lastMessage.chat_id != this.selectedChat?.chat_id ||
                  this.selectedChat == null)
              ) {
                setTimeout(() => {
                  this.getAllChats();
                }, 1000);
              }
              this.scrollMoveToBottom();
            }
          }
        }
      );
    });
  }

  getChatListForFreshChat(): Observable<any> {
    const param = {
      loginid: localStorage.getItem('UserId'),
    };
    return this.sharedService.fetchAllChats(param);
  }

  onIndividualChatBack() {
    this.selectedMessageId = [];
    this.selectedMessage = {
      selectedMessageId: [],
      selectedAttachmentId: [],
    };
    this.one2oneChats = [];
    this.selectedChat = [];
    this.chat_preview.dismiss();
    this.localStorage.removeItem('selectedChat');
    this.chatFilterSelectedValue = 'all';
    this.sharedService.emitunReadChatCountValue('true');
    this.removeQuerryParam();
    this.getAllChats();
  }

  //WHEN CLICK ON BACK ICON
  onBackbutton() {
    this.chatSearchedName = '';
    this.chatFilterSelectedValue = 'all';
    this.showSpinner = true;
    this.getAllChats();
    // this.selectedUsers = [];
    this.location.back();
  }

  //TO OPEN MENU SECTION
  openEndMenu() {
    this.sharedService.isMenuOpen = true;
    this.menuCtrl.open('end');
  }

  msg_id = '';
  //TO OPEN SELECTED ONE-TO-ONE AND GROUP CHATS FROM THE LIST
  // openChat_previewModal(chat) {
  //   // this.chatSearchedName = '';
  //   this.selectedChat = chat;
  //   this.localStorage.setItem(
  //     'selectedChat',
  //     JSON.stringify(this.selectedChat)
  //   );
  //   this.message = '';
  //   this.filterParams.one2oneChats = 'true';
  //   if (chat.chat_type == 'group') {
  //     this.getOneToOneAndGroupChat(chat.chat_id, 'group', false);
  //     this.getGroupMembers();
  //   } else {
  //     this.getOneToOneAndGroupChat(chat.executives_IDPK, 'individual', false);
  //   }
  //   this.updatedAsMessageRead(this.selectedChat.chat_id);
  //   this.sharedService.emitunReadChatCountValue('true');
  //   this.reply_text = {};
  //   this.isReply_msg = false;
  //    this.chatSearchedName != ''? this.msg_id = chat.message_id:'';
  //   // this.msg_id = chat.message_id

  //   this.chat_preview.present().then(() => {
  //    setTimeout(() => {

  //   console.log('Trying to scroll to ID:', chat.message_id);

  //   const el = document.querySelector(`[data-id-index="${chat.message_id}"]`);
  //   console.log('Found element:', el);

  //   if (el) {
  //     (el as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' });
  //   } else {
  //     console.warn('Message not found, falling back to bottom scroll');
  //     this.content.scrollToBottom(300);
  //   }

  // }, 1000);
  // setTimeout(()=>{
  // this.msg_id = ''
  // },2000)
  //   });

  //   // this.chat_preview.present().then(() => {
  //   //   setTimeout(() => {
  //   //     this.content.scrollToBottom(300);
  //   //   }, 100);
  //   // });
  // }

  openChat_previewModal(chat) {
    this.showSpinner = true;
    this.one2onelastmsgdate = '';
    this.selectedChat = chat;
    this.localStorage.setItem(
      'selectedChat',
      JSON.stringify(this.selectedChat)
    );
    this.message = '';
    this.filterParams.one2oneChats = 'true';

    this.updatedAsMessageRead(this.selectedChat.chat_id);
    this.sharedService.emitunReadChatCountValue('true');
    this.reply_text = {};
    this.isReply_msg = false;

    // Store msg_id if needed for scrolling later
    if (this.chatSearchedName !== '') {
      this.msg_id = chat.message_id;
    }

    setTimeout(() => {
      const loadMessages$ =
        chat.chat_type === 'group'
          ? this.getOneToOneAndGroupChat(chat.chat_id, 'group', '')
          : this.getOneToOneAndGroupChat(
              chat.executives_IDPK,
              'individual',
              ''
            );

      this.chat_preview.present().then(() => {
        this.sharedService.unReadChatCount = 0;
        setTimeout(() => {
          Promise.resolve(loadMessages$).then(() => {
            const el = document.querySelector(
              `[data-id-index="${chat.message_id}"]`
            );

            if (el) {
              (el as HTMLElement).scrollIntoView({
                behavior: 'smooth',
                block: 'center',
              });
            } else {
              this.content.scrollToBottom(300);
            }
          });
        }, 1000);

        setTimeout(() => {
          this.msg_id = '';
        }, 2500);
      });
    }, 100);

    if (chat.chat_type === 'group') {
      this.getGroupMembers();
    }
  }

  //To get all chats list
  getAllChats() {
    // this.showSpinner = true;
    const param = {
      loginid: localStorage.getItem('UserId'),
      logintype: localStorage.getItem('direct_inhouse'),
      propId: localStorage.getItem('PropertyId'),
    };
    this.sharedService.fetchAllChats(param).subscribe((response) => {
      if (
        response.status == 'True' &&
        (response.details ==
          'This Account is not allowed to access this feature' ||
          response.details == 'This Feature is Temporarily blocked')
      ) {
        Swal.fire({
          title: 'Chat Blocked',
          text: `This Feature is Temporarily blocked`,
          icon: 'warning',
          allowEscapeKey: false,
          allowOutsideClick: false,
          showCloseButton: true,
          showConfirmButton: false,
          heightAuto: false,
          backdrop: ` rgb(0 0 0 / 86%)`,
          customClass: {
            title: 'swal-title-custom',
            popup: 'swal-popup-custom',
            closeButton: 'swal-close-custom',
            htmlContainer: 'swal-text-custom',
            icon: 'my-warning-icon',
          },
        }).then((val) => {
          this.router.navigate(['home'], {
            queryParams: {
              htype: 'mandate',
              propid: '28773',
            },
          });
        });
      } else {
        if (this.filterParams.isnewGroupCreation == 'true') {
          // Filtered out group chats to show only individual chats while creating a new group.
          this.allChats = response['details'].filter((item) => {
            return item.chat_type !== 'group';
          });
          this.allChats1 = this.allChats;
          this.showSpinner = false;
        } else if (this.isGroupNameChange || this.isGroupNameEditing) {
          this.isGroupNameChange = false;
          this.allChats = response['details'];
          this.allChats1 = response['details'];

          this.selectedChat = response['details'].filter((item) => {
            if (item.chat_id == this.selectedChat.chat_id) {
              return item;
            }
          });
          this.selectedChat = this.selectedChat[0];
          this.localStorage.setItem(
            'selectedChat',
            JSON.stringify(this.selectedChat[0])
          );
          if (this.isGroupNameEditing) {
            this.isGroupNameEditing = !this.isGroupNameEditing;
          }
          this.groupName = this.selectedChat.executives_name;
          this.showSpinner = false;
        } else {
          this.allChats = response['details'];
          this.allChats1 = this.allChats;
          this.showSpinner = false;
        }
        this.onChatFilterSelected(this.chatFilterSelectedValue);
      }
    });
  }

  //To remove the opacity and pointer event for send icon
  removePointerEvent() {
    return this.message?.trim().length === 0;
  }
  isSending = false;
  //To send the text in one2one and group

  groupNameChanging() {
    this.showSpinner = this.isGroupNameEditing ? true : false;
    const param = {
      loginid: localStorage.getItem('UserId'),
      chattype: 'gct',
      groupid: this.selectedChat.chat_id,
      groupname: this.groupName,
      edit_gn: '1',
    };
    this.sharedService.createNewGroupChat(param).subscribe(() => {
      this.getAllChats();

      //  this.getOneToOneAndGroupChat();

      //  this.selectedChat =  this.selectedChat[0]
      // console.log(this.selectedChat)
      // this.openChat_previewModal(this.selectedChat)
      //  this.getOneToOneAndGroupChat(this.selectedChat.chat_id,'group','')
    });
  }

  sendMessage(event) {
    if (this.one2oneChats == undefined) {
      this.one2oneChats = [];
    }
    if (this.isSending || !this.message?.trim())
      // this.remove_reply_text()
      return;

    this.isSending = true;
    this.selectedMessageId = [];

    this.selectedMessage = {
      selectedMessageId: [],
      selectedAttachmentId: [],
    };
    let param;
    if (this.selectedChat.chat_type === 'group') {
      param = {
        senderid: localStorage.getItem('UserId'),
        chattype: 'gmsg',
        groupid: this.selectedChat.chat_id,
        message: this.message,
        msgid: this.isReply_msg
          ? this.reply_text?.[0]?.item_id
          : this.edit_text
          ? this.edit_text?.[0]?.item_id
          : '',
        edit: this.edit_text ? 1 : '',
      };
    } else {
      param = {
        senderid: localStorage.getItem('UserId'),
        recieverid: this.selectedChat.executives_IDPK,
        message: this.message,
        msgid: this.isReply_msg
          ? this.reply_text?.[0]?.item_id
          : this.edit_text
          ? this.edit_text?.[0].item_id
          : '',
        edit: this.edit_text ? 1 : '',
      };
    }

    let msg = {
      chat_id: this.selectedChat.chat_id,
      content: this.message,
      created_at: new Date().toISOString(),
      edited: 0,
      item_id: '',
      item_type: 'message',
      message_type: 'text',
      sender_id: localStorage.getItem('UserId'),
      sender_name: localStorage.getItem('Name'),
      updated_at: new Date().toISOString(),
    };

    this.one2oneChats.push(msg);
    this.scrollMoveToBottom();
    const tempMessage = this.message;
    this.message = '';
    this.sharedService.oneToOneAndGroupChatCheck(param).subscribe({
      next: () => {
        if (this.edit_text) {
          this.editMessage.dismiss();
        } else if (this.reply_text) {
          this.remove_reply_text();
        } else {
          this.message = '';
        }
      },
      error: (err) => {
        // Optionally: show error or rollback message
        this.message = tempMessage;
      },
      complete: () => {
        this.isSending = false; // re-enable sending
        // setTimeout(() => {
        //   this.messageInput.setFocus(); // Re-focus input to keep keyboard open
        // }, 100);
      },
    });
  }

  // @ViewChild('messageInput', { static: false }) messageInput: IonInput;

  // Move the scroll to bottom
  scrollMoveToBottom() {
    setTimeout(() => {
      this.content?.scrollToBottom(300);
      this.cdr.detectChanges();
    }, 200);
  }

  searchResults: any = [];
  messageSearch: any = [];
  chatsSearch: any = [];
  messageSearch1: any = [];
  chatsSearch1: any = [];

  //To search the chat by name or group name
  onChatSearch() {
    let allChats = this.filterChat;
    if (this.filterParams.isnewGroupCreation == 'true') {
      this.allChats1 = allChats.filter((item) => {
        return (
          item.executives_name
            ?.toLowerCase()
            .includes(this.chatSearchedName?.toLowerCase()) ||
          item.latest_message_content
            ?.toLowerCase()
            .includes(this.chatSearchedName?.toLowerCase())
        );
      });
    } else {
      const params = {
        searchTerm: this.chatSearchedName,
        loginid: this.localStorage.getItem('UserId'),
      };
      this.showSpinner = true;
      this.sharedService.searchCats(params).subscribe((res) => {
        this.showSpinner = false;
        this.searchResults = res;
        this.messageSearch = res['details']?.messages;
        this.messageSearch1 = res['details']?.messages;
        this.chatsSearch = res['details']?.chats;
        this.chatsSearch1 = res['details']?.chats;
      });
    }
  }

  //File uploading method
  handleFile(event: Event) {
    const target = event.target as HTMLInputElement;
    const files: FileList | null = target.files;

    // this.previewUrls = [];

    if (files) {
      Array.from(files).forEach((file: File) => {
        // const reader = new FileReader();
        // reader.onload = () => {
        //   this.previewUrls.push(reader.result as string);
        // };
        // reader.readAsDataURL(file);

        // Allowed MIME types
        const allowedTypes = [
          'application/pdf',
          'image/png',
          'image/jpeg',
          'video/mp4',
          'video/quicktime', // .mov
          'video/x-matroska', // .mkv
          'video/x-msvideo', // .avi
        ];

        // Check file type
        if (!allowedTypes.includes(file.type)) {
          this.resetFileInput(target);
          Swal.fire({
            title: 'Invalid File Type',
            text: `Only PDF, PNG, JPEG, and video files are allowed.`,
            icon: 'error',
            showConfirmButton: false,
            heightAuto: false,
            timer: 2000,
            backdrop: `rgb(0 0 0 / 86%)`,
            customClass: {
              title: 'swal-title-custom',
              popup: 'swal-popup-custom',
              closeButton: 'swal-close-custom',
              htmlContainer: 'swal-text-custom',
              icon: 'error-icon',
            },
          });
          return;
        }

        // Check file size
        if (file.size > 100000000) {
          this.resetFileInput(target);
          Swal.fire({
            title: 'File Size Exceeded',
            text: `File Size limit is 100MB`,
            icon: 'warning',
            showConfirmButton: false,
            timer: 1500,
            heightAuto: false,
            backdrop: ` rgb(0 0 0 / 86%)`,
            customClass: {
              title: 'swal-title-custom',
              popup: 'swal-popup-custom',
              closeButton: 'swal-close-custom',
              htmlContainer: 'swal-text-custom',
              icon: 'my-warning-icon',
            },
          });
          return;
        }
        const formData = new FormData();
        const userId = localStorage.getItem('UserId');
        const isGroup = this.selectedChat.chat_type === 'group';

        formData.append('senderid', userId);
        formData.append('message', this.message || '');
        formData.append('attachment', file);

        if (isGroup) {
          formData.append('chattype', 'gpatch');
          formData.append('groupid', this.selectedChat.chat_id);
        } else {
          formData.append('recieverid', this.selectedChat.executives_IDPK);
        }

        this.sharedService.sendAttachment(formData).subscribe((response) => {
          this.message = '';

          this.getAllChats();
          setTimeout(() => {
            this.getOneToOneAndGroupChat(
              isGroup
                ? this.selectedChat.chat_id
                : this.selectedChat.executives_IDPK,
              isGroup ? 'group' : 'individual',
              ''
            );
            this.scrollMoveToBottom();
          }, 100);
          this.resetFileInput(target);
        });
      });
    }
  }

  one2onelastmsgdate = '';

  //to get the individual and group messages
  getOneToOneAndGroupChat(
    chatOrRecieverid,
    chatType,
    isLoadmore,
    extraParam?: string
  ) {
    this.content?.getScrollElement().then((scrollEl) => {
      const prevScrollHeight = scrollEl.scrollHeight;
      this.previousScrolHeight = prevScrollHeight;
    });

    const param = {
      loginid: localStorage.getItem('UserId'),
      recieverid: chatType == 'individual' ? chatOrRecieverid : '',
      chattype: chatType == 'group' ? 'gcht' : '',
      groupid: chatType == 'group' ? chatOrRecieverid : '',
      fromdate: extraParam
        ? this.convertedSearchedDate(extraParam)
        : this.gettingtwodaysDate(isLoadmore).convertedfromdate,
      todate: extraParam
        ? new Date().toLocaleDateString('en-CA')
        : this.gettingtwodaysDate(isLoadmore).convertedtodate,
      encryptid: chatType == 'group' ? this.selectedChat.encryptid : '',
    };

    //if(this.one2oneChats.length<= this.count){
    return new Promise((resolve) => {
      this.sharedService.oneToOneAndGroupChat(param).subscribe((response) => {
        this.isLoading = false;
        this.one2oneChats = isLoadmore
          ? response?.['details'].concat(this.one2oneChats)
          : response['details'];
        this.one2onelastmsgdate = response?.['lastmsgdate'];
        //  To maintain the scroll position on the same
        if (isLoadmore) {
          setTimeout(() => {
            this.content.getScrollElement().then((scrollElAfter) => {
              const newScrollHeight = scrollElAfter.scrollHeight;
              const scrollDiff = newScrollHeight - this.previousScrolHeight;
              scrollElAfter.scrollTop = scrollDiff;
              resolve(response);
            });
          }, 50);
        }
        this.checkScrollPosition();
        resolve(response);
      });
    });

    return '';
  }

  checkScrollPosition() {
    this.content.getScrollElement().then((scrollEl) => {
      const scrollTop = scrollEl.scrollTop;
      const scrollHeight = scrollEl.scrollHeight;
      const clientHeight = scrollEl.offsetHeight;

      // if no scrolling possible
      if (scrollHeight <= clientHeight) {
        this.isAtTop = true;
        this.isAtBottom = true;
      } else {
        this.isAtTop = scrollTop === 0;
        this.isAtBottom = scrollTop + clientHeight >= scrollHeight - 100;
      }
    });
  }

  trackByMsgId(index: number, msg: any) {
    return msg.item_id; // Or whatever unique ID your messages have
  }

  // To reset the previous file data
  private resetFileInput(inputElement: HTMLInputElement) {
    inputElement.value = '';
  }

  //to open new group creation section
  newGroupCreation() {
    this.showSpinner = true;
    this.selectedUsers = [];
    this.chatSearchedName = '';
    this.sharedService.isnewGroupCreation = true;
    this.filterParams.isnewGroupCreation = 'true';
    this.getAllChats();
    this.router.navigate([], {
      queryParams: {
        isnewGroupCreation: true,
      },
      queryParamsHandling: 'merge',
    });
  }

  //to open new group naming and photo uploading section
  onGroupNaming() {
    this.filterParams.isGroupNaming = 'true';
    this.router.navigate([], {
      queryParams: {
        isGroupNaming: true,
      },
      queryParamsHandling: 'merge',
    });
  }

  //API calling to new group creation
  createNewGroupChat() {
    this.sharedService
      .createNewGroupChat(this.createNewGroup)
      .subscribe((response) => {
        if (response['status'] == 'True') {
          // location.reload();
        }
      });
    this.chatSearchedName = '';
    this.chatFilterSelectedValue = 'all';
    this.getAllChats();
    this.router.navigate([], {
      queryParams: {
        isnewGroupCreation: null,
        isGroupNaming: null,
      },
      queryParamsHandling: 'merge',
    });
  }

  // Called when a checkbox is clicked to select users for creating a group.
  ongrpSelectionCheckboxChange(event, data) {
    const index = this.selectedUsers.findIndex((item) =>
      item.group_name != null
        ? item.chat_id === data.chat_id
        : item.executives_IDPK === data.executives_IDPK
    );
    if (index === -1) {
      // Not present, so add
      this.selectedUsers.push(data);
    } else {
      // Already present, so remove
      this.selectedUsers.splice(index, 1);
    }

    const groupchatmemberid = this.selectedUsers
      .map((item) => item.executives_IDPK)
      .join(',');
    !this.isForwardMsg ? (this.createNewGroup.members = groupchatmemberid) : '';
  }

  //To check the checkbox for users who are selected
  isUserSelected(chat: any): boolean {
    if (this.isForwardMsg) {
      return this.selectedUsers.some((user) =>
        user.group_name != null
          ? user.chat_id === chat.chat_id
          : user.executives_IDPK === chat.executives_IDPK
      );
    } else {
      return this.selectedUsers.some(
        (user) => user.executives_IDPK === chat.executives_IDPK
      );
    }
  }

  // Called when the user clicks to download a PDF file
  downloadFileFromUrl(file, filename) {
    const imageUrl = 'https://chat.right2shout.in' + file;
    const fileName = file;

    fetch(imageUrl)
      .then((response) => response.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url); // Clean up
      })
      .catch((error) => {
        console.error('Download failed:', error);
      });
  }

  //display video in full screen
  goFullScreen() {
    const video = document.getElementById('myVideo') as HTMLVideoElement;
    if (!video) return;
    try {
      if (video.requestFullscreen) {
        video.requestFullscreen();
      } else if ((video as any).webkitEnterFullscreen) {
        (video as any).webkitEnterFullscreen(); // iOS
      } else if ((video as any).webkitRequestFullscreen) {
        (video as any).webkitRequestFullscreen(); // Safari
      } else if ((video as any).mozRequestFullScreen) {
        (video as any).mozRequestFullScreen(); // Firefox
      } else if ((video as any).msRequestFullscreen) {
        (video as any).msRequestFullscreen(); // IE/Edge
      } else {
      }
    } catch (error) {
      console.error('Fullscreen failed:', error);
    }
  }

  //remove all querryparam excep htype
  removeQuerryParam() {
    this.activeRoute.queryParams.subscribe((params) => {
      this.router.navigate([], {
        relativeTo: this.activeRoute,
        queryParams: {
          chatCallAssign: params['chatCallAssign'] || null,
          htype: params['htype'] || null,
        },
        queryParamsHandling: 'merge',
      });
    });
  }

  filterChat;
  //Called when we click on all, group and unread buttons
  onChatFilterSelected(option) {
    this.scrollToTop.emit();
    this.chatFilterSelectedValue = option;
    if (option == 'Groups') {
      this.allChats1 = this.allChats?.filter((response) => {
        return response.chat_type == 'group';
      });
      this.filterChat = this.allChats1;

      if (
        this.filterParams.isnewGroupCreation !== 'true' &&
        this.chatSearchedName != ''
      ) {
        this.messageSearch1 = this.messageSearch.filter((response) => {
          return response.chat_type == 'group';
        });
        this.chatsSearch1 = this.chatsSearch.filter((response) => {
          return response.chat_type == 'group';
        });
      }
    } else if (option == 'all') {
      this.filterChat = this.allChats;
      this.allChats1 = this.allChats;
      this.messageSearch1 = this.messageSearch;
      this.chatsSearch1 = this.chatsSearch;
    } else if (option == 'Unread') {
      this.allChats1 = this.allChats.filter((response) => {
        return response.unreadcount > 0;
      });
      this.filterChat = this.allChats1;

      if (
        this.filterParams.isnewGroupCreation !== 'true' &&
        this.chatSearchedName != ''
      ) {
        this.messageSearch1 = this.messageSearch.filter((response) => {
          return response.unreadcount > 0;
        });
        this.chatsSearch1 = this.chatsSearch.filter((response) => {
          return response.unreadcount > 0;
        });
      }
    }
  }

  //API calling to delete the member from the group
  deleteMember(gpMember) {
    Swal.fire({
      title: 'Are you sure?',
      text: `You want to remove ${gpMember?.membername}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      heightAuto: false,
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, remove it!',
      backdrop: ` rgb(0 0 0 / 86%)`,
      customClass: {
        title: 'swal-title-custom',
        popup: 'swal-popup-custom',
        closeButton: 'swal-close-custom',
        htmlContainer: 'swal-text-custom',
        icon: 'my-warning-icon',
        confirmButton: 'confirm-btn',
        cancelButton: 'cancel-btn',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteGroupMember.memberid = gpMember?.memberid;
        this.deleteGroupMember.groupid = gpMember?.groupid;
        this.deleteGroupMember.actiontype = 'remove';
        this.sharedService
          .deleteGroupMember(this.deleteGroupMember)
          .subscribe((response) => {
            this.openChat_previewModal(this.selectedChat);
            this.getGroupMembers();
          });
      }
    });
  }

  // This is called when a member leaves the group
  leaveGroup() {
    if (this.isGroupAdmin) {
      Swal.fire({
        title: 'You are the Admin',
        text: `You Can't Exit from the Group`,
        icon: 'warning',
        showConfirmButton: false,
        timer: 1500,
        backdrop: ` rgb(0 0 0 / 86%)`,
        heightAuto: false,
        customClass: {
          title: 'swal-title-custom',
          popup: 'swal-popup-custom',
          closeButton: 'swal-close-custom',
          htmlContainer: 'swal-text-custom',
          icon: 'my-warning-icon',
        },
      });
    } else {
      Swal.fire({
        title: 'Are you sure?',
        text: `You want to Exit from the group?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        heightAuto: false,
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes',
        backdrop: ` rgb(0 0 0 / 86%)`,
        customClass: {
          title: 'swal-title-custom',
          popup: 'swal-popup-custom',
          closeButton: 'swal-close-custom',
          htmlContainer: 'swal-text-custom',
          icon: 'my-warning-icon',
          confirmButton: 'confirm-btn',
          cancelButton: 'cancel-btn',
        },
      }).then((result) => {
        if (result.isConfirmed) {
          this.deleteGroupMember.memberid = this.localStorage.getItem('UserId');
          this.deleteGroupMember.groupid = this.selectedChat.chat_id;
          this.deleteGroupMember.actiontype = 'leave';
          this.sharedService
            .deleteGroupMember(this.deleteGroupMember)
            .subscribe((response) => {
              this.openChat_previewModal(this.selectedChat);
              this.getGroupMembers();
            });
        }
      });
    }
  }

  //To display the group information modal
  openGroupInfo() {
    this.getAllChats();
    this.getGroupMembers();
    this.groupInfoModal.present();
  }

  //Animation for modal open
  enterAnimation = (baseEl: HTMLElement) => {
    const root = baseEl.shadowRoot;

    const backdropAnimation = this.animationCtrl
      .create()
      .addElement(root!.querySelector('ion-backdrop')!)
      .fromTo('opacity', '0.01', 'var(--backdrop-opacity)');

    const wrapperAnimation = this.animationCtrl
      .create()
      .addElement(root!.querySelector('.modal-wrapper')!)
      .keyframes([
        { offset: 0, opacity: '0', transform: 'scale(0)' },
        { offset: 1, opacity: '0.99', transform: 'scale(1)' },
      ]);

    return this.animationCtrl
      .create()
      .addElement(baseEl)
      .easing('ease-out')
      .duration(500)
      .addAnimation([backdropAnimation, wrapperAnimation]);
  };

  leaveAnimation = (baseEl: HTMLElement) => {
    return this.enterAnimation(baseEl).direction('reverse');
  };

  //to get the group members
  getGroupMembers() {
    const param = {
      senderid: localStorage.getItem('UserId'),
      groupid: this.selectedChat.chat_id,
      req: 'gmbrlst',
    };

    this.sharedService.getGroupMembers(param).subscribe((response) => {
      const userId = this.localStorage.getItem('UserId');
      this.gpMembers = response['details'];
      response['details']?.forEach((element) => {
        if (element.memberid == userId) {
          const indexInFp = this.gpMembers.findIndex(
            (item) => item.memberid == userId
          );
          if (indexInFp > -1) {
            this.gpMembers.splice(indexInFp, 1);
          }
          this.gpMembers.unshift(element);
        }
        if (
          element.memberid == this.localStorage.getItem('UserId') &&
          element.grouprole == '1'
        ) {
          this.isGroupAdmin = true;
        }
      });
      this.gpMembers1 = this.gpMembers;

      this.isMember = response['details'].some((m) => m.memberid == userId); //check whether group member have chat authority or not
    });
  }

  //To display add member modal
  onAddMember() {
    this.selectedUsers = [];
    this.allChats1 = this.allChats.filter(
      (chat) =>
        !this.gpMembers.some(
          (member) => member.memberid === chat.executives_IDPK
        ) && chat.chat_type !== 'group'
    );
    this.filterChat = this.allChats1;
    this.addMember.present();
  }

  //Add the member to group
  addMembe1r() {
    this.createNewGroup.groupname = this.selectedChat.executives_name;
    this.sharedService
      .createNewGroupChat(this.createNewGroup)
      .subscribe((response) => {
        if (response['status'] == 'True') {
          this.getGroupMembers();
          this.addMember.dismiss();
        }
      });
  }

  //To hide and display the add member seach section
  // Used to search members when adding them to a group
  searchMembers() {
    this.searchVisible = true;
    this.searchAnimationClass = 'slide-in';
  }

  //To Close the Search section
  closeSearch() {
    this.onAddMember();
    this.chatSearchedName = '';
    this.searchAnimationClass = 'slide-out';
    setTimeout(() => {
      this.searchVisible = false;
      this.searchAnimationClass = '';
    }, 300);
  }
  //end

  onGroupMemberSearch() {
    this.gpMembers1 = this.gpMembers.filter((item) => {
      return item.membername
        .toLowerCase()
        .includes(this.gpMemberSearchedName.toLowerCase());
    });
  }

  onAddMemberbackButton() {
    this.popoverController.dismiss();
    this.getAllChats();
    this.isForwardMsg = false;
    this.selectedUsers = [];
    this.addMember.dismiss();
  }

  //called when click on search in popover
  onOnetoOneChatSearch() {
    this.isOnetoOneChatSearch = true;
    this.popoverController.dismiss();
  }

  // This is called when searching within the individual chat section
  onOneToOneSearchChange() {
    this.individualChatSearch();
    this.findMatches();
    this.currentMatchIndex = -1;
  }

  findMatches() {
    this.matchedIndexes = [];
    this.one2oneChats?.forEach((msg, index) => {
      if (
        msg.content &&
        this.oneToOneSearchName &&
        msg.content
          .toLowerCase()
          .includes(this.oneToOneSearchName.toLowerCase())
      ) {
        this.matchedIndexes.push(index);
      }
    });

    if (this.oneToOneSearchName == '') {
      this.getOneToOneAndGroupChat(
        this.selectedChat.chat_id,
        this.selectedChat.chat_type,
        ''
      );
    }
  }

  // get filteredMessages() {
  //   if (!this.one2oneChats) return [];
  //   if (!this.oneToOneSearchName) {
  //     return this.one2oneChats;
  //   }
  //   return this.one2oneChats?.filter((msg) =>
  //     msg.content?.toLowerCase().includes(this.oneToOneSearchName.toLowerCase())
  //   );
  // }

  navigateMatch(direction: 'prev' | 'next' | '') {
    if (!this.matchedIndexes.length) return;
    if (direction === 'next') {
      this.currentMatchIndex =
        (this.currentMatchIndex + 1) % this.matchedIndexes.length;
    } else if (direction === 'prev') {
      this.currentMatchIndex =
        (this.currentMatchIndex - 1 + this.matchedIndexes.length) %
        this.matchedIndexes.length;
    } else if (direction === '') {
      this.currentMatchIndex = 0;
    }
    const indexToScroll = this.matchedIndexes[this.currentMatchIndex];
    const el = document.querySelector(`[data-index="${indexToScroll}"]`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });

    setTimeout(() => {
      el?.classList?.remove('selected-match');
    }, 2000);
  }

  reply_msg_index;
  async scrollToReplyMsg(msg) {
    await this.getOneToOneAndGroupChat(
      this.selectedChat.chat_type == 'group'
        ? this.selectedChat.chat_id
        : this.selectedChat.executives_IDPK,
      this.selectedChat.chat_type,
      false,
      msg.reply_id_date
    );

    console.log(this.one2oneChats);
    const indexes = this.one2oneChats
      .map((item, index) =>
        item.content === msg.replied_message && item.deleted == 0 ? index : -1
      )
      .filter((index) => index !== -1);
    this.reply_msg_index = indexes[0];
    const el = document.querySelector(`[data-index="${this.reply_msg_index}"]`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });

    setTimeout(() => {
      this.reply_msg_index = [];
      el?.classList?.remove('selected-match');
    }, 1000);
  }

  currentDateLabel;
  previousScrolHeight;
  @ViewChildren('dateLabels') dateLabels: QueryList<ElementRef>;
  // Scroll event handler
  onScroll(event: CustomEvent) {
    const scrollTop = event.detail.scrollTop;
    let currentLabel = '';
    this.dateLabels.forEach((dateLabelRef) => {
      const el = dateLabelRef.nativeElement;
      const offsetTop = el.offsetTop;

      if (offsetTop <= scrollTop + 10) {
        currentLabel = el.innerText;
      }
    });

    if (currentLabel) {
      this.currentDateLabel = currentLabel;
    }

    // const scrollTop = event.detail.scrollTop;
    this.content.getScrollElement().then((scrollEl) => {
      const scrollTop = scrollEl.scrollTop;
      const scrollHeight = scrollEl.scrollHeight;

      this.previousScrolHeight = scrollEl.scrollHeight;
      const clientHeight = scrollEl.offsetHeight;
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;
      this.isAtBottom = isNearBottom;
      const isAtTop = scrollTop === 0;
      this.isAtTop = isAtTop;
    });
  }

  // async openGallery() {
  //   try {
  //     const images = await Camera.pickImages({
  //       quality: 100,
  //       presentationStyle: 'fullscreen',
  //       limit: 5,
  //     });

  //     for (const image of images.photos) {
  //       const response = await fetch(image.webPath!);
  //       const blob = await response.blob();
  //       const file = new File([blob], `image_${Date.now()}.${image.format}`, { type: blob.type });

  //       const formData = new FormData();
  //       formData.append('senderid', localStorage.getItem('UserId'));
  //       formData.append('recieverid', this.selectedChat.executives_IDPK);
  //       formData.append('message', this.message);
  //       formData.append('attachment',file);
  //       const filename = image.webPath?.split('/').pop();

  //       // this.dataService.sendAttachment(formData).subscribe((response)=>{
  //       // })
  //     }
  //   } catch (error) {
  //     console.error('Error picking images:', error);
  //   }
  // }

  // async openFilePicker() {
  //   const result = await FilePicker.pickFiles({
  //     types: ['*/*']
  //   });

  //   if (result.files && result.files.length > 0) {
  //     const file = result.files[0];
  //   }
  // }

  // async openCamera() {
  //   const image = await Camera.getPhoto({
  //     quality: 90,
  //     allowEditing: false,
  //     resultType: CameraResultType.DataUrl,
  //     source: CameraSource.Camera
  //   });
  //   this.previewImage = image.dataUrl;
  // }

  updatedAsMessageRead(id) {
    let param = {
      loginid: this.localStorage.getItem('UserId'),
      chatid: id,
    };
    this.sharedService.convertMessageToRead(param).subscribe((resp) => {
      this.getAllChats();
    });
  }

  onGroupInfoModalClose() {
    this.chatFilterSelectedValue = 'all';
    this.getAllChats();
    this.getGroupMembers();
    this.groupInfoModal.dismiss();
    this.gpMemberSearchedName = '';
    this.isGroupNameEditing = false;
  }

  onDeleteMessage() {
    Swal.fire({
      title: 'Delete Message?',
      text: `confirm to delete Message..!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      heightAuto: false,
      cancelButtonColor: '#aaa',
      confirmButtonText: 'Delete',
      backdrop: ` rgb(0 0 0 / 86%)`,
      customClass: {
        title: 'swal-title-custom',
        popup: 'swal-popup-custom',
        closeButton: 'swal-close-custom',
        htmlContainer: 'swal-text-custom',
        icon: 'my-warning-icon',
        confirmButton: 'confirm-btn',
        cancelButton: 'cancel-btn',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.sharedService
          .deleteMessage(
            this.mesgContent.item_type == 'attachment'
              ? this.mesgContent.item_id
              : this.selectedMessageId
          )
          .subscribe(() => {
            const isGroup = this.selectedChat.chat_type === 'group';
            this.getOneToOneAndGroupChat(
              isGroup
                ? this.selectedChat.chat_id
                : this.selectedChat.executives_IDPK,
              isGroup ? 'group' : 'individual',
              ''
            );
            if (this.oneToOneSearchName != '') {
              this.isOnetoOneChatSearch = true;
            }
            this.selectedMessageId = [];
            this.selectedMessage = {
              selectedMessageId: [],
              selectedAttachmentId: [],
            };
          });
      } else {
        this.selectedMessageId = [];
        this.selectedMessage = {
          selectedMessageId: [],
          selectedAttachmentId: [],
        };
      }
    });
  }

  isReply_msg = false;
  reply_text;
  edit_text;
  mesgContent: any = [];
  selectionModeStarted = false;

  userIdType = typeof localStorage.getItem('UserId');
  getType(value: any): string {
    return typeof value;
  }

  selectedMessage = {
    selectedMessageId: [],
    selectedAttachmentId: [],
  };
  onMessageLongPress(msg) {
    this.ishideDelete = false;
    this.ishideEdit = false;

    if (!this.selectionModeStarted) {
      this.selectionModeStarted = true;
      this.toggleMessageSelection(msg);
    }

    if (this.oneToOneSearchName) {
      this.isOnetoOneChatSearch = false;
    }

    this.isreceiver = localStorage.getItem('UserId') == msg.sender_id;
    // if (!this.selectedMessageId.includes(msg.item_id)) {
    //   this.selectedMessageId.push(msg.item_id);
    // }

    if (
      !this.selectedMessage.selectedMessageId.includes(msg.item_id) &&
      msg.message_type !== 'attachment'
    ) {
      this.selectedMessageId.push(msg.item_id);
      this.selectedMessage = {
        selectedMessageId: [...this.selectedMessageId],
        selectedAttachmentId: [],
      };
    } else if (msg.message_type === 'attachment') {
      if (!Array.isArray(this.selectedMessage.selectedAttachmentId)) {
        this.selectedMessage.selectedAttachmentId = [];
      }
      if (!this.selectedMessage.selectedAttachmentId.includes(msg.item_id)) {
        this.selectedMessage.selectedAttachmentId.push(msg.item_id);
      }
      this.selectedMessage.selectedMessageId = [];
      this.selectedMessageId = []; // reset the array
    }

    // To display the message info
    const message = this.one2oneChats.filter((item) => {
      return msg.message_type === 'attachment'
        ? item.item_id == this.selectedMessage.selectedAttachmentId?.[0]
        : item.item_id == this.selectedMessage.selectedMessageId?.[0];
      // if (
      //   item.item_id == this.selectedMessage.selectedMessageId?.[0] ||
      //   item.item_id == this.selectedMessage.selectedAttachmentId?.[0]
      // ) {
      //   return item;
      // }
    });
    // console.log(this.selectedMessage.selectedMessageId?.[0]);
    // const filteredmessage = message.filter((item) => {
    //   return item.item_id == this.selectedMessage.selectedMessageId?.[0];
    // });

    // this.mesgContent = filteredmessage[0];
    // console.log(this.mesgContent[0]);
    // console.log(this.one2oneChats);

    if (msg.message_type === 'attachment') {
      this.mesgContent = message[0];
    } else {
      this.mesgContent = message[0];
    }

    this.hideDeleteEdit(this.mesgContent);
  }

  ishideDelete = false;
  ishideEdit = false;

  hideDeleteEdit(msg) {
    const createAt = new Date(msg.created_at);
    const targetTime = new Date(createAt.getTime() + 10 * 60 * 1000);
    const fiveMintargetTime = new Date(createAt.getTime() + 5 * 60 * 1000);

    const now = new Date();
    const delayMs = targetTime.getTime() - now.getTime();
    const FiveMindelayMs = fiveMintargetTime.getTime() - now.getTime();
    if (delayMs > 0) {
      setTimeout(() => {
        this.ishideDelete = true;
      }, delayMs);

      setTimeout(() => {
        this.ishideEdit = true;
      }, FiveMindelayMs);
    } else {
      this.ishideDelete = true;
      this.ishideEdit = true;
    }
  }

  onMessageClick(msg: any) {
    if (this.selectionModeStarted) {
      this.toggleMessageSelection(msg);
    }
  }

  toggleMessageSelection(msg: any) {
    // const index1 = this.mesgContent.indexOf(msg);
    // if (index1 > -1) {
    //   this.mesgContent.splice(index1, 1);
    // } else {
    //   this.mesgContent.push(msg);
    // }

    // if (this.mesgContent.length == 0) {
    //   this.selectionModeStarted = false;
    // }

    const index =
      msg.message_type !== 'attachment'
        ? this.selectedMessageId.indexOf(msg.item_id)
        : parseInt(this.selectedMessage.selectedAttachmentId[0]);

    // if (index > -1) {
    //   this.selectedMessageId.splice(index, 1);
    // } else {
    //   this.selectedMessageId.push(msg.item_id);
    // }
    // if (this.selectedMessageId.length == 0) {
    //   this.selectionModeStarted = false;
    // }

    if (index > -1) {
      if (msg.message_type !== 'attachment') {
        this.selectedMessageId.splice(index, 1);
        this.selectedMessage = {
          selectedMessageId: [...this.selectedMessageId],
          selectedAttachmentId: [],
        };
      } else if (msg.message_type === 'attachment') {
        this.selectedMessage = {
          selectedMessageId: [],
          selectedAttachmentId: [],
        };
        this.selectedMessageId = [];
      }
      this.ishideDelete = false;
    } else {
      if (
        !this.selectedMessage.selectedMessageId.includes(msg.item_id) &&
        msg.message_type !== 'attachment'
      ) {
        this.selectedMessageId.push(msg.item_id);
        this.selectedMessage = {
          selectedMessageId: [...this.selectedMessageId],
          selectedAttachmentId: [],
        };
      } else if (msg.message_type === 'attachment') {
        this.selectedMessage = {
          selectedMessageId: [],
          selectedAttachmentId: msg.item_id,
        };
        this.selectedMessageId = []; // reset the array
      }
    }

    if (
      (msg.message_type !== 'attachment' &&
        this.selectedMessageId.length == 0 &&
        this.selectedMessage.selectedAttachmentId.length == 0) ||
      (msg.message_type === 'attachment' &&
        this.selectedMessage.selectedAttachmentId.length == 0)
    ) {
      this.selectionModeStarted = false;
    }

    // To display the message info
    const message = this.one2oneChats.filter((item) => {
      if (
        item.item_id ==
          this.selectedMessage.selectedMessageId?.[
            this.selectedMessage.selectedMessageId.length - 1
          ] ||
        item.item_id ==
          this.selectedMessage.selectedAttachmentId?.[
            this.selectedMessage.selectedMessageId.length - 1
          ]
      ) {
        return item;
      }
    });

    this.mesgContent = message[1];
    this.hideDeleteEdit(message[1]);
  }

  onCopyMessage(number) {
    this.dialNumberModal.dismiss();
    navigator.clipboard
      .writeText(number ? number : this.mesgContent.content)
      .then(() => {
        this.presentToast(number);
        this.popoverController.dismiss();
        this.selectedMessageId = [];
        this.selectedMessage = {
          selectedMessageId: [],
          selectedAttachmentId: [],
        };
        this.mesgContent = [];
      })
      .catch((err) => console.error('Failed to copy:', err));
  }

  onDeleteHeaderRemove() {
    if (this.oneToOneSearchName != '' && this.oneToOneSearchName != undefined) {
      this.isOnetoOneChatSearch = true;
    }
    this.selectedMessageId = [];
    this.selectedMessage = {
      selectedMessageId: [],
      selectedAttachmentId: [],
    };
    this.mesgContent = [];
  }

  onReplymsg() {
    this.checkTextareaHeight();
    this.reply_text = this.one2oneChats.filter((item) => {
      return (
        item.item_id ==
        (this.mesgContent.item_type == 'attachment'
          ? this.selectedMessage.selectedAttachmentId?.[0]
          : this.selectedMessageId)
      );
    });
    this.isReply_msg = true;
    this.oneToOneSearchName = '';
    this.selectedMessageId = [];
    this.selectedMessage = {
      selectedMessageId: [],
      selectedAttachmentId: [],
    };
  }

  onEditMessage() {
    this.edit_text = this.one2oneChats.filter((item) => {
      return item.item_id == this.selectedMessageId;
    });
    this.message = this.edit_text[0]['content'];
    this.editMessage.present();
  }

  onEdit_msg_back() {
    this.editMessage.dismiss();
    this.popoverController.dismiss();
    this.selectedMessageId = [];
    this.selectedMessage = {
      selectedMessageId: [],
      selectedAttachmentId: [],
    };
    this.message = '';
    this.edit_text = [];
  }

  onSwipe(event, msg) {}

  remove_reply_text() {
    this.message = '';
    this.isReply_msg = false;
    this.reply_text = '';
    this.selectedMessageId = [];
    this.selectedMessage = {
      selectedMessageId: [],
      selectedAttachmentId: [],
    };
  }

  onReplymsgWithCopy() {
    this.reply_text = this.one2oneChats.filter((item) => {
      return (
        item.item_id ==
        (this.mesgContent.item_type == 'attachment'
          ? this.selectedMessage.selectedAttachmentId?.[0]
          : this.selectedMessageId)
      );
    });

    this.isReply_msg = true;
    this.message = this.reply_text[0].content;
    this.oneToOneSearchName = '';
    this.selectedMessageId = [];
    this.selectedMessage = {
      selectedMessageId: [],
      selectedAttachmentId: [],
    };
  }

  @ViewChild('dialNumberModal') dialNumberModal;
  dialNumber;
  onNumberClick(number) {
    this.dialNumber = number;
    this.dialNumberModal.present();
  }
  ondialCall() {
    window.open(`tel:${this.dialNumber}`, '_system');
  }

  @ViewChild('editMessage') editMessage;
  forward_text;
  forward_msg: { id: number; message: string }[] = [];

  onForwordMessage() {
    this.isForwardMsg = true;
    let forward_text = this.one2oneChats.filter((item) => {
      return this.selectedMessageId.includes(item.item_id);
    });

    forward_text = forward_text.map((msg) => ({
      id: msg.item_id,
      message: msg.content,
    }));
    this.forward_msg.push(...forward_text);

    this.addMember.present();
  }

  forwardingMessage() {
    const groupids = this.selectedUsers
      .filter((item) => item.chat_type === 'group')
      .map((item) => item.chat_id)
      .join(',');

    const individualids = this.selectedUsers
      .filter((item) => item.chat_type !== 'group')
      .map((item) => item.executives_IDPK)
      .join(',');

    const baseParam = {
      senderid: localStorage.getItem('UserId'),
      forward_msg: JSON.stringify(this.forward_msg),
      forward: 1,
    };

    const calls = [];

    if (groupids) {
      const groupParam = {
        ...baseParam,
        chattype: 'gmsg',
        message: this.forward_msg[0].message,
        groupid: groupids,
        recieverid: '',
      };
      calls.push(this.sharedService.oneToOneAndGroupChatCheck(groupParam));
    }

    if (individualids) {
      const individualParam = {
        ...baseParam,
        chattype: '',
        groupid: '',
        recieverid: individualids,
      };
      calls.push(this.sharedService.oneToOneAndGroupChatCheck(individualParam));
    }

    const tempMessage = this.message;
    Promise.all(calls.map((obs) => obs.toPromise()))
      .then(() => {
        this.addMember.dismiss();
        this.message = '';
        this.forward_msg = [];
        this.selectedUsers = [];
        this.selectedMessageId = [];
        this.selectedMessage = {
          selectedMessageId: [],
          selectedAttachmentId: [],
        };
      })
      .catch((err) => {
        this.message = tempMessage;
      })
      .finally(() => {
        this.isSending = false;
      });
  }

  async presentToast(number) {
    const toast = await this.toastController.create({
      message: number ? 'Phone number copied' : 'Message copied',
      duration: 2000,
      cssClass: 'custom-toast',
      position: 'bottom',
    });
    toast.present();
  }

  checkTextareaHeight() {
    let messageRow = document.getElementById('messageRow');
    messageRow = messageRow as HTMLTextAreaElement;
    const height = messageRow.offsetHeight;
    return height > 45;
  }

  isGroupNameChange = false;
  groupName;

  onGroupNameChange() {
    this.groupName = this.selectedChat.executives_name;
    this.isGroupNameChange = true;
    this.popoverController.dismiss();
  }

  gettingtwodaysDate(isLoadmore) {
    const today = isLoadmore
      ? this.one2onelastmsgdate[0]['last_message_date'].split(' ')[0]
      : this.selectedChat.latest_message_time
      ? new Date(this.selectedChat.latest_message_time)
      : new Date();

    const fromdate = new Date(today);
    const todate = new Date(today);

    // Move back by offset days
    fromdate.setDate(fromdate.getDate() - 1);
    return {
      convertedfromdate: fromdate.toLocaleDateString('en-CA'),
      convertedtodate: todate.toLocaleDateString('en-CA'),
    };
  }

  convertedSearchedDate(date) {
    const fromdate = new Date(date);
    return fromdate.toLocaleDateString('en-CA');
  }

  @ViewChild('infoModal') infoModal;
  messageInfoData;
  onMessageInfo() {
    const param = {
      sender_id: this.mesgContent.sender_id,
      messageid: this.mesgContent.item_id,
    };
    this.sharedService.fetchMessageInfo(param).subscribe((response) => {
      this.messageInfoData = response['details'];
      this.infoModal.present();
    });
  }

  onInfoModalBack() {
    this.selectedMessageId = [];
    this.selectedMessage = {
      selectedMessageId: [],
      selectedAttachmentId: [],
    };
    this.selectedMessageId = [];
    this.popoverController.dismiss();
    this.infoModal.dismiss();
  }

  createdDate;
  individualChatSearch() {
    const params = {
      searchTerm: this.oneToOneSearchName,
      loginid: this.localStorage.getItem('UserId'),
      chat_id: this.selectedChat.chat_id,
    };
    this.showSpinner = true;
    this.sharedService.searchCats(params).subscribe((res) => {
      if (res['status'] == 'True') {
        this.createdDate = res['details']?.['messages']?.[0]?.created_at;
        this.msg_id = res['details']?.['messages']?.[0]?.item_id;
      }
      this.showSpinner = false;
    });
  }

  onOneToOneSearchEnter(event) {
    this.getOneToOneAndGroupChat(
      this.selectedChat.chat_id,
      this.selectedChat.chat_type,
      '',
      this.createdDate
    );
    setTimeout(() => {
      if (this.oneToOneSearchName != '') {
        const filteredMessages = this.one2oneChats?.filter((msg) =>
          msg.content
            ?.toLowerCase()
            .includes(this.oneToOneSearchName.toLowerCase())
        );

        this.showNotFound = filteredMessages.length === 0;
        if (!(this.oneToOneSearchName && filteredMessages?.length === 0)) {
          this.scrollToMessageId(this.msg_id);
        }
      }
    }, 1000);

    setTimeout(() => {
      this.showNotFound = false;
    }, 3000);
  }
  showNotFound = false;

  scrollToMessageId(messageId: number | string) {
    const el = document.querySelector(`[data-id-index="${messageId}"]`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // highlight effect (optional)
      el.classList.add('selected-match');
      setTimeout(() => {
        el.classList.remove('selected-match');
      }, 2000);
    }
  }

  disappear24(type) {
    let param = {
      encryptid: type,
      groupid: this.selectedChat.chat_id,
    };
    this.sharedService.disappear24Message(param).subscribe({
      next: (resp) => {
        location.reload();
      },
      error: (err) => {},
    });
  }

  mainsearch = false;

  onMainSearch() {
    this.mainsearch = true;
    this.searchAnimationClass = 'slide-in';
    this.scrollToTop.emit();
  }

  closeMainSearch() {
    this.chatSearchedName = '';
    this.mainsearch = false;
    this.searchAnimationClass = 'slide-out';
  }

  formatLatestMessageTime(datetimeString: string): string {
    const inputDate = new Date(datetimeString);
    const today = new Date();

    // Remove time part for correct date comparison
    const inputDay = new Date(
      inputDate.getFullYear(),
      inputDate.getMonth(),
      inputDate.getDate()
    );
    const todayDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    const diffTime = todayDay.getTime() - inputDay.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    // Today -> show time only
    if (diffDays === 0) {
      return inputDate.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
      });
    }

    // Yesterday
    if (diffDays === 1) {
      return 'Yesterday';
    }

    // Older -> show date (DD-MM-YYYY)
    const dd = inputDate.getDate().toString().padStart(2, '0');
    const mm = (inputDate.getMonth() + 1).toString().padStart(2, '0');
    const yyyy = inputDate.getFullYear();

    return `${dd}/${mm}/${yyyy}`;
  }

  @ViewChild('groupInput') groupInput;
  editGroupName(input: any) {
    this.groupName = this.selectedChat.executives_name;
    this.isGroupNameEditing = !this.isGroupNameEditing;

    setTimeout(() => {
      if (this.groupInput) {
        this.groupInput.setFocus();
      }
    }, 50);
  }
  ngOnDestroy() {
    this.sharedService.dismissAllOverlays();
  }
}
