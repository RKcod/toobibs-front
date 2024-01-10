import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ApiService } from "../../api/api.service";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { Router } from "@angular/router";
import { NgxSpinnerService } from "ngx-spinner";
// @ts-ignore
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { RtcRole } from "../../agora-token";
import { AgoraClient, NgxAgoraService, StreamEvent, Stream, ClientEvent } from "ngx-agora";

@Component({
  selector: 'app-call-window',
  templateUrl: './call-window.component.html',
  styleUrls: ['./call-window.component.scss']
})
export class CallWindowComponent implements OnInit {
  @ViewChild('hisVideo') hisVideo: any;
  @Input() public user_id: any;
  @Input() public first_name: any;
  @Input() public last_name: any;
  @Input() public phone: any;
  @Input() public event_id: any;

  audio_src = "";

  time: number = 0;
  display: any;
  interval: any;
  audio = new Audio();
  stream: any = null;
  @Input() public direction;

  call_obj = JSON.parse(localStorage.getItem("call") || '{}');

  user: any = ApiService.getUser();

  peer: any;
  private client: AgoraClient;
  localCallId = 'agora_local';
  remoteCallId = 'agora_remote';

  uid: any = null;
  title = 'AgoraDemo';
  localStream: Stream | null = null; // Add
  remoteCalls: any[] = []; // Add
  remoteStream: any;
  constructor(
    private ngxAgoraService: NgxAgoraService,
    public afs: AngularFirestore,
    public activeModal: NgbActiveModal,
    public api: ApiService,
    public router: Router,
    private spinner: NgxSpinnerService
  ) {
    this.uid = Math.floor(Math.random() * 100);
    this.client = this.ngxAgoraService.createClient({ mode: 'rtc', codec: 'h264' });
  }

  ngOnInit(): void {
    this.assignClientHandlers();
    this.assignLocalStreamHandlers(); // Add
    this.stream = null;
    this.uid = Math.floor(Math.random() * 100).toString();
    this.startCall();
    this.playAudio("../../../assets/audio/ringing.mp3");
    this.checkCalls();
  }

  playAudio(src_: string): void {
    this.audio.src = src_;
    this.audio.loop = true;
    this.audio.load();
    this.audio.play();
  }

  closeCall(reason: string): void {
    this.ngxAgoraService.client.leave(() => {
      if (this.localStream != null) {
        this.localStream.stop();
        this.localStream.close();
      }
    }, (err: any) => {
      console.error(err);
    });
    this.audio.pause();
    this.pauseTimer();
    this.afs.collection("calls", ref => ref.where("long_id", '==', this.event_id)).valueChanges({ idField: 'dataId' })
      .subscribe((snapshots: any) => {
        this.afs.collection('calls').doc(snapshots[0].dataId).delete()
          .then(
            res => {
              this.activeModal.dismiss(reason);
            }, err => {
              this.activeModal.dismiss(reason);
            });
      }, err => {
        this.activeModal.dismiss(reason);
      });
  }

  startCall(): void {
    this.localStream = this.ngxAgoraService.createStream({ streamID: this.uid, audio: true, video: true, screen: false });
    this.initLocalStream(() => {
      this.localStream!.play(this.localCallId);
      this.join(uid => this.publish(), error => console.error(error));
    });
  }

  join(onSuccess?: (uid: number | string) => void, onFailure?: (error: Error) => void): void {
    const n = this.user.real_id + '' + this.user.phone;
    const token = this.api.generateToken(n, this.uid, RtcRole.PUBLISHER);
    this.client.join(token, n, this.uid, onSuccess, onFailure);
  }

  publish(): void {
    this.client.publish(this.localStream!, err => console.log('Erreur lors de la publication du flux local : ' + err));
  }

  private assignClientHandlers(): void {
    this.client.on(ClientEvent.LocalStreamPublished, evt => {
      //console.log('Publish local stream successfully');
    });

    this.client.on(ClientEvent.Error, error => {
      //console.log('Got error msg:', error.reason);
      if (error.reason === 'DYNAMIC_KEY_TIMEOUT') {
        this.client.renewChannelKey(
          '',
          () => //console.log('Renewed the channel key successfully.'),
            renewError => console.error('Renew channel key failed: ', renewError)
        );
      }
    });

    this.client.on(ClientEvent.RemoteStreamAdded, evt => {
      const stream = evt.stream as Stream;
      this.client.subscribe(stream, { audio: true, video: true }, err => {
        console.log('Subscribe stream failed', err);
      });
      this.remoteStream = stream;
    });

    this.client.on(ClientEvent.RemoteStreamSubscribed, evt => {
      const stream = evt.stream as Stream;
      const id = this.getRemoteId(stream);
      if (!this.remoteCalls.includes(id)) {
        this.remoteCalls.push(id);
        this.startTimer();
        setTimeout(() => stream.play(id), 2000);
      }
    });

    this.client.on(ClientEvent.RemoteStreamRemoved, evt => {
      const stream = evt.stream as Stream;
      if (stream) {
        stream.stop();
        this.remoteCalls = this.remoteCalls.filter(call => call !== `${this.getRemoteId(stream)}`);
        //console.log(`Remote stream is removed ${stream.getId()}`);
      }
    });

    this.client.on(ClientEvent.PeerLeave, evt => {
      const stream = evt.stream as Stream;
      if (stream) {
        stream.stop();
        this.remoteCalls = this.remoteCalls.filter(call => call !== `${this.getRemoteId(stream)}`);
        //console.log(`${evt.uid} left from this channel`);
      }
    });
  }

  private assignLocalStreamHandlers(): void {
    this.localStream!.on(StreamEvent.MediaAccessAllowed, () => {
      //console.log('accessAllowed');
    });

    this.localStream!.on(StreamEvent.MediaAccessDenied, () => {
      //console.log('accessDenied');
    });
  }

  private initLocalStream(onSuccess?: () => any): void {
    this.localStream!.init(
      () => {
        this.localStream!.play(this.localCallId);
        if (onSuccess) {
          onSuccess();
        }
      },
      err => console.error('getUserMedia failed', err)
    );
  }

  private getRemoteId(stream: Stream): string {
    return `agora_remote-${stream.getId()}`;
  }

  checkCalls(): void {
    this.afs.collection("calls", ref => ref.where("long_id", '==', this.event_id)).valueChanges({ idField: 'dataId' })
      .subscribe((snapshots: any) => {
        //console.log("call checking : ", snapshots);
        if (snapshots.length > 0) {
          const res = snapshots[0];
          this.call_obj = res;
          if (res.has_missed == 1) {
            this.audio.pause();
            this.direction = "calling";
            this.startCall();
          } else if (res.has_missed == 2) {
            this.api.handleErrors("Le patient a rejeté l'appel");
            this.closeCall("rejected");
          } else if (res.has_missed == 3) {
            //console.log("has_missed", snapshots);
            this.closeCall("Call ended");
          }
        }
      }, err => {

      });
  }

  startTimer(): void {
    this.interval = setInterval(() => {
      if (this.time === 0) {
        this.time++;
      } else {
        this.time++;
      }
      this.display = this.transform(this.time)
    }, 1000);
  }

  pauseTimer(): void {
    clearInterval(this.interval);
  }

  transform(value: number): string {
    var sec_num = value;
    var hours = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);
    return this.api.addZeroToNumber(hours) + ':' + this.api.addZeroToNumber(minutes) + ':' + this.api.addZeroToNumber(seconds);
  }
}
