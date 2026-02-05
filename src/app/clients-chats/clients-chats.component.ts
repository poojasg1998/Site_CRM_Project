import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Location } from '@angular/common';
import { VoiceRecorder } from 'capacitor-voice-recorder';
import {
  IonContent,
  IonLoading,
  MenuController,
  PopoverController,
  ToastController,
} from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedService } from '../shared.service';
import { debounceTime, Observable, Subject } from 'rxjs';
import { EchoService } from '../echo.service';
import Swal from 'sweetalert2';
import { param } from 'jquery';
import { WhatsAppEchoService } from '../whats-app-echo.service';

@Component({
  selector: 'app-clients-chats',
  templateUrl: './clients-chats.component.html',
  styleUrls: ['./clients-chats.component.scss'],
})
export class ClientsChatsComponent implements OnInit {
  @ViewChild('loader', { static: true }) loader!: IonLoading;
  @ViewChild('chat_preview') chat_preview;
  @ViewChild('dialNumberModal') dialNumberModal;
  @ViewChild('chat_previewIon_content', { static: false }) content: IonContent;

  filteredParams = {
    selectedChat: '',
    loginid: localStorage.getItem('UserId'),
    crmtype: '',
    execid: '',
    isIndividualChatId: '',
    sender_id: '',
    chatListSearch: '',
  };
  isIndividualChatModal = false;
  allChats: any;
  allChats1: any;
  execList;
  selectedExec;
  message = '';
  one2oneChats: any = [];
  selectedChat: any;
  oneToOneChatSearch;
  dialNumber: any;
  localStorage = localStorage;
  isOnetoOneChatSearch: boolean;
  currentMatchIndex: number = -1;
  matchedIndexes: number[] = [];
  assignee: any;
  showSpinner = false;
  isAdmin = false;
  isAtBottom: boolean = false;
  audioFile: File;
  recordedAudioFile: File;
  userid: string;

  constructor(
    private activeRoute: ActivatedRoute,
    private router: Router,
    private location: Location,
    private menuCtrl: MenuController,
    private sharedService: SharedService,
    private _whatsappEchoService: WhatsAppEchoService,
    private toastController: ToastController,
    private popoverController: PopoverController,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.activeRoute.queryParams.subscribe(async (params) => {
      this.getQueryParams();
      this.userid = this.localStorage.getItem('UserId');
      if (this.filteredParams.chatListSearch != '') {
        this.allChats = [];
        this.allChats1 = [];
        this.fetchData(this.filteredParams.chatListSearch);
      }
      this._whatsappEchoService.listenToChannel(
        'database-changes',
        '.DatabaseNotification',
        (data) => {
          if (this.one2oneChats.length == 0) {
            this.one2oneChats = [];
          }
          const messagesArray = data[1];
          if (Array.isArray(messagesArray) && messagesArray.length > 0) {
            let lastMessage;
            if (messagesArray.length > 1) {
              lastMessage = messagesArray[messagesArray.length - 1];
            } else if (messagesArray.length == 1) {
              lastMessage = messagesArray[0];
            }

            let alreadyExists;
            if (this.one2oneChats.length != 0) {
              alreadyExists = this.one2oneChats?.['details'].some(
                (msg) => msg.item_id === lastMessage.item_id
              );
            }

            if (!alreadyExists) {
              if (
                lastMessage.sender_id == this.userid ||
                lastMessage.sender_id == this.selectedChat?.customer_number ||
                (this.userid == '1' &&
                  lastMessage.sender_id == this.filteredParams.execid)
              ) {
                this.one2oneChats['details'] = this.one2oneChats?.[
                  'details'
                ].filter((item) => {
                  return item.item_id != '';
                });
                this.one2oneChats?.['details'].push(lastMessage);
              } else if (messagesArray.length == 1) {
                this.getChatListForWhatsAppFreshChat().subscribe((exec) => {
                  this.allChats = exec;
                  this.allChats1 = exec;

                  let executives = this.allChats?.filter((chat) => {
                    return (
                      chat.customer_number ==
                      this.filteredParams.isIndividualChatId
                    );
                  });

                  this.selectedChat = executives[0];

                  if (
                    lastMessage.sender_id == this.userid ||
                    lastMessage.sender_id ==
                      this.selectedChat?.customer_number ||
                    (this.userid == '1' &&
                      lastMessage.sender_id == this.filteredParams.execid)
                  ) {
                    this.one2oneChats['details'] = this.one2oneChats?.[
                      'details'
                    ].filter((item) => {
                      return item.item_id != '';
                    });
                    this.one2oneChats?.['details'].push(lastMessage);
                  }
                });
              }
              this.scrollMoveToBottom();
            }
          }
          if (!this.one2oneChats) {
            this.one2oneChats = [];
          }
        }
      );
      this.getAllWhatsAppChats();

      this.isAdmin = this.localStorage.getItem('Role') == '1';
      this.getexecutiveslist();
      this.searchSubject.pipe(debounceTime(300)).subscribe((searchTerm) => {
        this.fetchData(searchTerm);
      });
    });
  }

  getChatListForWhatsAppFreshChat(): Observable<any> {
    const param = {
      loginid: this.userid,
      execid: this.filteredParams.execid,
    };
    return this.sharedService.fetchAllWhatsAppChats(param);
  }

  //called when click on search in popover
  onOnetoOneChatSearch() {
    this.isOnetoOneChatSearch = true;
    this.popoverController.dismiss();
  }

  // This is called when searching within the individual chat section
  onOneToOneSearchChange() {
    this.findMatches();
    this.currentMatchIndex = -1;
  }

  findMatches() {
    this.matchedIndexes = [];
    this.one2oneChats?.forEach((msg, index) => {
      if (
        msg.content &&
        this.oneToOneChatSearch &&
        msg.content
          .toLowerCase()
          .includes(this.oneToOneChatSearch.toLowerCase())
      ) {
        this.matchedIndexes.push(index);
      }
    });
  }

  navigateMatch(direction: 'prev' | 'next') {
    if (!this.matchedIndexes.length) return;
    if (direction === 'next') {
      this.currentMatchIndex =
        (this.currentMatchIndex + 1) % this.matchedIndexes.length;
    } else {
      this.currentMatchIndex =
        (this.currentMatchIndex - 1 + this.matchedIndexes.length) %
        this.matchedIndexes.length;
    }
    const indexToScroll = this.matchedIndexes[this.currentMatchIndex];
    const el = document.querySelector(`[data-index="${indexToScroll}"]`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });

    setTimeout(() => {
      el.classList.remove('selected-match');
    }, 2000);
  }

  getOne2OneChats() {
    const filterId = this.filteredParams.isIndividualChatId.split('_');
    filterId[1];
    const param = {
      loginid: this.filteredParams.execid
        ? this.filteredParams.execid
        : this.selectedChat != '' && this.selectedChat != undefined
        ? this.selectedChat?.exec_id
        : '1',
      recieverid:
        this.selectedChat != '' && this.selectedChat != undefined
          ? this.selectedChat?.customer_number
          : this.allChats1[0].customer_number,
    };
    this.sharedService
      .fetchWhatsAppOne2OneChats(param)
      .subscribe((response) => {
        this.one2oneChats = response;

        if (!this.filteredParams.execid) {
          this.selectedExec = this.one2oneChats['executives'][0].exec_id;
          this.filteredParams.execid = this.selectedExec;
        } else {
          this.selectedExec = this.one2oneChats['executives'].filter(
            (item) => item.exec_id == this.filteredParams.execid
          );
          this.selectedExec = this.selectedExec[0].exec_id;
        }
        this.showSpinner = false;
      });

    setTimeout(() => {
      this.scrollMoveToBottom();
    }, 1000);
  }
  scrollMoveToBottom() {
    setTimeout(() => {
      this.content?.scrollToBottom(300);
      this.cdr.detectChanges();
    }, 200);
  }

  //WHEN CLICK ON BACK ICON
  onBackbutton() {
    this.location.back();
  }

  openEndMenu() {
    this.sharedService.isMenuOpen = true;
    this.menuCtrl.open('end');
  }

  getQueryParams() {
    const queryString = window.location.search;
    const queryParams = {};
    new URLSearchParams(queryString).forEach((value, key) => {
      queryParams[key] = value;
    });

    Object.keys(this.filteredParams).forEach((key) => {
      if (queryParams.hasOwnProperty(key)) {
        this.filteredParams[key] = queryParams[key];
      } else if (key == 'propid' && 'ranavPropId' in localStorage) {
        this.filteredParams[key] = '28773';
      } else if (key !== 'loginid' && key !== 'limit' && key !== 'limitrows') {
        this.filteredParams[key] = '';
      }
    });
  }

  addQueryParams() {
    const queryParams = {};
    let paramsChanged = false;
    for (const key in this.filteredParams) {
      if (this.filteredParams.hasOwnProperty(key)) {
        // Set the param if it's not empty, otherwise set to null
        const newParamValue =
          this.filteredParams[key] !== '' ? this.filteredParams[key] : null;
        // Check if query parameters have changed
        if (this.activeRoute.snapshot.queryParams[key] !== newParamValue) {
          paramsChanged = true;
        }
        queryParams[key] = newParamValue;
      }
    }
    this.router
      .navigate([], { queryParams, queryParamsHandling: 'merge' })
      .then(() => {});
  }

  onChatFilterSelected(data) {
    this.filteredParams.selectedChat = data;
    if (data != 'exec') this.addQueryParams();
  }

  getAllWhatsAppChats() {
    this.showSpinner = true;
    this.sharedService
      .fetchAllWhatsAppChats(this.filteredParams)
      .subscribe((response) => {
        if (response['status'] == 'True') {
          this.allChats = response['details'];
          this.showSpinner = false;

          if (this.filteredParams.selectedChat == 'unread') {
            this.allChats1 = response['details'].filter((item) => {
              if (item.unreadcount == '1') {
                return item;
              }
            });
          } else if (
            this.filteredParams.isIndividualChatId != '' ||
            this.filteredParams.chatListSearch != ''
          ) {
            // if (this.filteredParams.chatListSearch) {
            //    this.selectedChat = response['details'].filter(
            //      (item) =>
            //        item.chat_id == this.filteredParams.isIndividualChatId
            //    );
            //    this.selectedChat = this.selectedChat[0];
            // } else {
            this.selectedChat = response['details'].filter(
              (item) =>
                item.customer_number == this.filteredParams.isIndividualChatId
            );
            this.selectedChat = this.selectedChat[0];
            // }
            setTimeout(() => {
              this.getOne2OneChats();
            }, 1000);
            // const filterId = this.filteredParams.isIndividualChatId.split('_');

            // if (!filterId[1]) {
            //   this.selectedChat = response['details'].filter(
            //     (item) => item.chat_id == this.filteredParams.isIndividualChatId
            //   );
            //   this.selectedChat = this.selectedChat[0];
            //   this.getOne2OneChats();
            // } else {
            //   this.getOne2OneChats();
            // }
          } else {
            this.allChats1 = response['details'];
          }
          this.loader.dismiss();
        } else {
          this.showSpinner = false;
          this.allChats = [];
          this.allChats1 = [];
        }
      });
  }

  searchSubject = new Subject<string>();
  searchClient(event): void {
    const query = event.target.value;
    if (query.length >= 5) {
      this.searchSubject.next(query);
    } else {
      this.allChats1 = this.allChats;
    }
  }

  fetchData(query: string) {
    let searchedData;
    if (/^[\d\s+]+$/.test(query)) {
      searchedData = query.replace(/\s+/g, '');
      searchedData = searchedData.slice(-10);
    } else {
      searchedData = query;
    }
    this.sharedService
      .searchLeads(
        searchedData,
        this.filteredParams.crmtype,
        localStorage.getItem('Role') == '1'
          ? ''
          : localStorage.getItem('UserId'),
        ''
      )
      .subscribe({
        next: (response) => {
          if (response['status'] == 'True') {
            if (
              this.filteredParams.chatListSearch &&
              this.filteredParams.isIndividualChatId
            ) {
              this.allChats1 = response['Searchlist'].filter(
                (item) =>
                  item.customer_number == this.filteredParams.isIndividualChatId
              );
            } else {
              this.allChats1 = response['Searchlist'];

              const groupedMap = new Map();

              response['Searchlist'].forEach((lead: any) => {
                const number = lead.customer_number ?? '';
                const name = lead.customer_name ?? '';
                const execname = lead.execname ?? '';
                const leadStage = lead.Lead_stage ?? '';
                const idpk = lead.customer_IDPK ?? '';
                const crmType = lead.crm_type ?? '';
                const propid = lead.propid ?? '';

                const key = number + '_' + leadStage + '_' + crmType;

                if (!groupedMap.has(key)) {
                  groupedMap.set(key, {
                    customer_number: number,
                    customer_name: name,
                    Lead_stage: leadStage,
                    customer_IDPK: idpk,
                    crm_type: crmType,
                    propid: propid,

                    execnames: new Set(execname ? [execname] : []),
                    originalLeads: [lead],
                  });
                } else {
                  const existing = groupedMap.get(key);
                  if (execname) {
                    existing.execnames.add(execname);
                  }
                  existing.originalLeads.push(lead);
                }
              });
              // this.allChats1 = Array.from(groupedMap.values()).map((item) => ({
              //   ...item,
              //   execnames: Array.from(item.execnames),
              // }));
            }
          } else {
            this.allChats1 = [];
          }
        },
        error: (error) => {
          this.allChats1 = [];
        },
      });
  }

  trackByMsgId(index: number, msg: any) {
    return msg.item_id; // Or whatever unique ID your messages have
  }

  getexecutiveslist() {
    this.sharedService.getexecutiveslist().subscribe((res) => {
      this.execList = res['Executiveslist'];

      if (this.filteredParams.execid != '') {
        const selectedExec = this.execList.find(
          (e) => e.ID === this.filteredParams.execid
        );
        this.selectedExec = selectedExec;
        this.filteredParams.loginid = this.filteredParams.execid;
      } else {
        this.filteredParams.loginid = localStorage.getItem('UserId');
      }
    });
  }

  onExecutive(event) {
    this.filteredParams.loginid = event.value.ID;
    this.filteredParams.execid = event.value.ID;
    this.addQueryParams();
  }

  openChat_previewModal(chat) {
    this.filteredParams.isIndividualChatId = chat.customer_number;
    this.showSpinner = true;
    this.addQueryParams();
  }

  onIndividualChatBack() {
    this.filteredParams = {
      selectedChat: 'all',
      loginid: localStorage.getItem('UserId'),
      crmtype: '',
      execid: '',
      isIndividualChatId: '',
      sender_id: '',
      chatListSearch: '',
    };
    this.message = '';
    this.showEmojiPicker = false;
    this.oneToOneChatSearch = '';
    this.addQueryParams();
  }

  checkTextareaHeight() {
    let messageRow = document.getElementById('messageRow');
    messageRow = messageRow as HTMLTextAreaElement;
    const height = messageRow.offsetHeight;
    return height > 45;
  }

  onNumberClick(number) {
    this.dialNumber = number;
    this.dialNumberModal.present();
  }

  onCopyMessage(number) {
    this.dialNumberModal.dismiss();
    // navigator.clipboard
    //   .writeText(number ? number : this.mesgContent.content)
    //   .then(() => {
    //     this.presentToast(number);
    //     this.popoverController.dismiss();
    //     this.selectedMessageId = [];
    //     this.selectedMessage = {
    //       selectedMessageId: [],
    //       selectedAttachmentId: null,
    //     };
    //     this.mesgContent = [];
    //   })
    //   .catch((err) => console.error('Failed to copy:', err));
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

  // isNumberSearch(value: string): boolean {
  //   // if (!value) return false;
  //   // return /^\d+$/.test(value); // only digits allowed
  //   this.hasCommonId(this.allChats, this.allChats1);
  // }

  hasCommonId(a: any[], b: any[]): boolean {
    const idsB = new Set(b.map((obj) => obj.customer_IDPK));
    return a.some((obj) => idsB.has(obj.customer_IDPK));
  }

  whatsAppNumberCheck(chat) {
    const param = {
      number: chat.customer_number,
    };
    Swal.fire({
      html: '<b>We are checking the number in the database.<br/>Please wait for a moment...</b>',
      allowOutsideClick: false,
      showConfirmButton: false,
      heightAuto: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    this.sharedService.whatsAppNumberCheck(param).subscribe((response) => {
      if (response['error'] == 'Channel not found') {
        Swal.fire({
          title: 'Number Not Register',
          text: "This number not register with What's app",
          icon: 'error',
          heightAuto: false,
          showConfirmButton: false,
          showCancelButton: false,
          timer: 2000,
        });
      } else {
        this.filteredParams.isIndividualChatId = chat.customer_number;
        this.addQueryParams();
        Swal.close();
      }
    });
  }

  onScroll(event: CustomEvent) {
    // const scrollTop = event.detail.scrollTop;
    this.content.getScrollElement().then((scrollEl) => {
      const scrollTop = scrollEl.scrollTop;
      const scrollHeight = scrollEl.scrollHeight;
      const clientHeight = scrollEl.offsetHeight;
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;
      this.isAtBottom = isNearBottom;
    });
  }

  removePointerEvent() {
    return this.message?.trim().length === 0;
  }

  sendMessage() {
    const param: any = {
      recieverid: this.filteredParams.isIndividualChatId,
      message: this.message,
      senderid: this.selectedExec ? this.selectedExec : '1',
    };

    this.sharedService.oneToOneChatCheck(param).subscribe((response) => {
      this.message = '';
    });
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

  //File uploading method
  handleFile(event: Event) {
    const target = event.target as HTMLInputElement;
    const files: FileList | null = target.files;

    if (files) {
      Array.from(files).forEach((file: File) => {
        // Allowed MIME types
        const allowedTypes = [
          'application/pdf',
          'image/png',
          'image/jpeg',
          'video/mp4',
          'video/quicktime',
          'video/x-matroska',
          'video/x-msvideo',
          'audio/mpeg',
        ];

        // Check file type
        if (!allowedTypes.includes(file.type)) {
          this.resetFileInput(target);
          Swal.fire({
            title: 'Invalid File Type',
            text: `Only PDF, PNG, JPEG, and video files are allowed.`,
            icon: 'error',
            showConfirmButton: false,
            timer: 2000,
            heightAuto: false,
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
          });
          return;
        }
        const formData = new FormData();

        formData.append(
          'senderid',
          this.selectedExec
            ? this.selectedExec
            : this.localStorage.getItem('UserId')
        );
        formData.append('recieverid', this.selectedChat?.customer_number);
        formData.append('message', this.message || '');
        formData.append(
          'chattype',
          file.type == 'application/pdf'
            ? 'document'
            : file.type == 'image/png' || file.type == 'image/jpeg'
            ? 'image'
            : file.type == 'video/mp4'
            ? 'video'
            : file.type == 'audio/mpeg'
            ? 'audio'
            : ''
        );
        formData.append('attachment', file);

        this.sharedService
          .sendWhatsAppAttachment(formData)
          .subscribe((response) => {
            this.message = '';

            this.getAllWhatsAppChats();
            setTimeout(() => {
              this.getOne2OneChats();
              this.scrollMoveToBottom();
            }, 100);

            this.resetFileInput(target);
          });
      });
    }
  }

  // To reset the previous file data
  private resetFileInput(inputElement: HTMLInputElement) {
    inputElement.value = '';
  }

  isPlaying = false;
  progress = 0;
  currentTime = 0;
  duration = 0;

  togglePlay(audio: HTMLAudioElement) {
    if (this.isPlaying) {
      audio.pause();
      this.isPlaying = false;
    } else {
      audio.play();
      this.isPlaying = true;
    }
  }

  updateProgress(audio: HTMLAudioElement) {
    this.currentTime = audio.currentTime * 1000;
    this.duration = audio.duration * 1000;
    this.progress = (audio.currentTime / audio.duration) * 100;
  }
  audioEnded() {
    this.progress = 0;
    this.currentTime = 0;
    // this.duration = 0;
    this.isPlaying = false;
  }

  seekAudio(event: any, audio: HTMLAudioElement) {
    const value = event.detail.value;
    audio.currentTime = value / 1000;
    this.currentTime = value;
  }
  setDuration(audio: HTMLAudioElement) {
    this.duration = audio.duration * 1000; // in seconds
  }

  isRecording = false;
  recordedAudio: any = null;
  recordingTimer: any;
  audioUrl: string | null = null;
  recordingSeconds = 0;
  formattedTime = '00:00';
  async requestPermission() {
    const result = await VoiceRecorder.requestAudioRecordingPermission();
    if (!result.value) {
    }
  }

  async startRecording() {
    const permission = await VoiceRecorder.hasAudioRecordingPermission();
    if (!permission.value) {
      await this.requestPermission();
    }
    this.isRecording = true;
    this.recordedAudio = null;

    this.recordingSeconds = 0;
    this.updateFormattedTime();

    // Start timer
    this.recordingTimer = setInterval(() => {
      this.recordingSeconds++;
      this.updateFormattedTime();
    }, 1000);
    await VoiceRecorder.startRecording();
  }
  data;
  updateFormattedTime() {
    const minutes = Math.floor(this.recordingSeconds / 60);
    const seconds = this.recordingSeconds % 60;
    this.formattedTime =
      String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');
  }

  async stopRecording() {
    this.isRecording = false;

    if (this.recordingTimer) {
      clearInterval(this.recordingTimer);
      this.recordingTimer = null;
    }

    const result = await VoiceRecorder.stopRecording();

    this.data = result.value;

    this.recordedAudio = result.value?.recordDataBase64 || null;

    if (this.recordedAudio) {
      this.audioUrl = 'data:audio/mp4;base64,' + this.recordedAudio;
    }

    if (!result.value?.recordDataBase64) {
      console.error('No recording data returned');
      return;
    }
    const base64 = this.audioUrl;
    const filename = 'recording.mp3'; // or mp4
    const mimeType = result.value?.mimeType;

    this.base64ToFile(base64, filename, mimeType);
  }

  playAudio() {
    if (this.audioUrl) {
      const audio = new Audio(this.audioUrl);
      audio.play();
    }
  }

  isHolding = false;
  startX = 0;
  currentX = 0;
  translateX = 0;
  cancelThreshold = 50;

  // Triggered when user presses the button (mouse or touch)
  onPress(event) {
    this.isHolding = true;
    const mic = document.getElementById('recorder_icon');
    if (mic) {
      mic.classList.add('grow');
    }
    this.startX = this.getX(event);
    // this.requestPermission();
    this.startRecording();
  }

  onMove(event: MouseEvent | TouchEvent) {
    if (!this.isHolding) return;

    this.currentX = this.getX(event);
    const deltaX = this.currentX - this.startX;
    this.translateX = Math.max(-80, Math.min(0, deltaX));
  }

  // Triggered when user releases the button (mouse or touch)
  onRelease() {
    this.isHolding = false;
    const mic = document.getElementById('recorder_icon');
    if (mic) {
      mic.classList.remove('grow');
    }

    if (Math.abs(this.translateX) > this.cancelThreshold) {
      // Cancel action here
    } else {
      this.sendAudioFile(this.recordedAudioFile);
      // Save action here
    }

    // this.holdStartTime = null;
    this.translateX = 0;
    this.stopRecording();
  }

  getX(event): number {
    if (event instanceof MouseEvent) {
      return event.clientX;
    } else {
      return event.touches[0].clientX;
    }
  }

  // Triggered if user drags finger/mouse away without releasing
  onLeave() {
    this.isHolding = false;
  }
  recorderClass;
  //To Close the Search section
  closeSearch() {
    this.recorderClass = 'slide-out';
  }

  base64ToFile(base64: string, filename: string, contentType: string): File {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: contentType });
    const file = new File([blob], filename, { type: contentType });

    this.recordedAudioFile = file;
    return new File([blob], filename, { type: contentType });
  }

  sendAudioFile(file: File) {
    const formData = new FormData();

    formData.append(
      'senderid',
      this.selectedExec
        ? this.selectedExec
        : this.localStorage.getItem('UserId')
    );
    formData.append('recieverid', this.selectedChat?.customer_number);
    formData.append('message', this.message || '');
    formData.append('chattype', 'audio');
    formData.append('attachment', file);

    this.sharedService
      .sendWhatsAppAttachment(formData)
      .subscribe((response) => {
        this.message = '';
        this.getAllWhatsAppChats();
        setTimeout(() => {
          this.getOne2OneChats();
          this.scrollMoveToBottom();
        }, 100);
      });
  }
  isOpened = false;
  @Input() emojiInput$: Subject<string> | undefined;
  @ViewChild('container') container: ElementRef<HTMLElement> | undefined;
  emojiSelected(event: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    this.emojiInput$?.next(event.emoji.native);
  }
  eventHandler = (event: Event) => {
    // Watching for outside clicks
    if (!this.container?.nativeElement.contains(event.target as Node)) {
      this.isOpened = false;
      window.removeEventListener('click', this.eventHandler);
    }
  };
  toggled() {
    // if (!this.container) {
    //   return;
    // }
    this.isOpened = !this.isOpened;
    if (this.isOpened) {
      window.addEventListener('click', this.eventHandler);
    } else {
      window.removeEventListener('click', this.eventHandler);
    }
  }

  clearSearch() {
    this.router.navigate([], {
      queryParams: {
        chatListSearch: null,
      },
      queryParamsHandling: 'merge',
    });
  }

  onExecChange(event: any) {
    const execId = event.detail.value;
    this.filteredParams.loginid = event.detail.value;
    this.filteredParams.execid = event.detail.value;
    this.addQueryParams();
  }

  addEmoji(event: any) {
    this.message += event.emoji.native;
  }
  showEmojiPicker = false;

  toggleEmojiPicker() {
    this.showEmojiPicker = !this.showEmojiPicker;
  }
}
