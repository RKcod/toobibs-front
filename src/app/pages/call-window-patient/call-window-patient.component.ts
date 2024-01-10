import { Component, Input, OnInit } from '@angular/core';
import { ApiService} from "../../api/api.service";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { Router } from "@angular/router";
import { NgxSpinnerService } from "ngx-spinner";
// @ts-ignore
import { AgoraClient, NgxAgoraService, StreamEvent, Stream, ClientEvent } from "ngx-agora";
import { RtcRole } from '../../agora-token';


@Component({
  selector: 'app-call-window-patient',
  templateUrl: './call-window-patient.component.html',
  styleUrls: ['./call-window-patient.component.scss']
})
export class CallWindowPatientComponent implements OnInit {
  //@ViewChild('myVideo') myVideo: any;
  //@ViewChild('hisVideo') hisVideo: any;
  //@ViewChild('audioIn') audioIn: any;
  //@ViewChild('audioOut') audioOut: any;

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
  /*
  caller
  receiver
   */
  @Input() public direction: any;

  call_obj: any = JSON.parse(localStorage.getItem("call") || '{}');

  user: any = ApiService.getUser();

  peer: any;

  private client: AgoraClient;
  localCallId = 'agora_local';
  remoteCallId = 'agora_remote';


  uid: any = null;
  title = 'AgoraDemo';
  localStream: Stream; // Add
  remoteCalls: any = []; // Add

  constructor(private ngxAgoraService: NgxAgoraService, public afs: AngularFirestore, public activeModal: NgbActiveModal, public api: ApiService, public router: Router, private spinner: NgxSpinnerService) {
    this.uid = Math.floor(Math.random() * 100);
    this.client = this.ngxAgoraService.createClient({ mode: 'rtc', codec: 'h264' });
  }

  ngOnInit(): void {
    this.stream = null;
    this.assignClientHandlers();
    //this.peer = new Peer("TOOBIBS_" + this.user.real_id);

    this.playAudio("../../../assets/audio/incoming.mp3");
    /*setTimeout(() => {
      //document.getElementById("audio").loop = true;
      //document.getElementById("audio").play();
    }, 3000);*/
    this.afs.collection("calls", ref => ref.where("long_id", '==', this.call_obj.long_id).where("has_missed", '==', 3)).valueChanges({idField: 'dataId'})
      .subscribe((snapshots: any) => {
        //console.log("has_missed", snapshots);
        if (snapshots.length > 0)
          this.closeCall("Call ended");
      });

  }

  playAudio(src_) {
    this.audio = new Audio();
    this.audio.src = src_;
    this.audio.loop = true;
    this.audio.load();
    this.audio.play();
  }


  startCall(){
    //this.assignClientHandlers();
    this.localStream = this.ngxAgoraService.createStream({ streamID: this.uid, audio: true, video: true, screen: false });
    this.assignLocalStreamHandlers();
    // Join and publish methods added in this step
    this.initLocalStream(() => this.join(uid => this.publish(), error => console.error(error)));
  }

  /**
   * Attempts to connect to an online chat room where users can host and receive A/V streams.
   */
  join(onSuccess?: (uid: number | string) => void, onFailure?: (error: Error) => void): void {
    const n = this.call_obj.user_from_id + '' + this.call_obj.dr_phone;
    const token = this.api.generateToken(n, this.uid, RtcRole.PUBLISHER);
    //console.log(n);
    //console.log(this.uid);
    //console.log(token);
    this.client.join(token, n, this.uid, onSuccess, onFailure);
  }

  /**
   * Attempts to upload the created local A/V stream to a joined chat room.
   */
  publish(): void {
    this.client.publish(this.localStream, err => console.log('Publish local stream error: ' + err));
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
        //console.log('Subscribe stream failed', err);
      });
    });

    this.client.on(ClientEvent.RemoteStreamSubscribed, evt => {
      const stream = evt.stream as Stream;
      const id = this.remoteCallId; //"remote";//this.getRemoteId(stream);
      if (!this.remoteCalls.length) {
        this.remoteCalls.push(id);
        this.startTimer();
        setTimeout(() => stream.play(this.remoteCallId), 3000);
      }
    });

    this.client.on(ClientEvent.RemoteStreamRemoved, evt => {
      const stream = evt.stream as Stream;
      if (stream) {
        stream.stop();
        this.remoteCalls = [];
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
    this.localStream.on(StreamEvent.MediaAccessAllowed, () => {
      //console.log('accessAllowed');
    });

    // The user has denied access to the camera and mic.
    this.localStream.on(StreamEvent.MediaAccessDenied, () => {
      //console.log('accessDenied');
    });
  }

  private initLocalStream(onSuccess?: () => any): void {
    this.localStream.init(
      () => {
        // The user has granted access to the camera and mic.
        this.localStream.play(this.localCallId);
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

  /*
  startCall() {
    const n = this.call_obj.user_from_id + '' + this.call_obj.dr_phone;
    const uid = this.user.real_id + '' + Date.now();
    const token = this.api.generateToken(n, uid, RtcRole.PUBLISHER);
    //console.log(n);
    //console.log(uid);
    //console.log(token);
    this.agoraService.client.join("7ff7d1c9d3f3402eabf1819baa3d6343", n, token, uid, (uid) => {
      //console.log("uid",uid);
      this.localStream = this.agoraService.createStream(uid, true, null, null, true, false);
      this.localStream.setVideoProfile('720p_3');
      this.subscribeToStreams();
    });
  }

  // Add
  private subscribeToStreams() {
    this.localStream.on("accessAllowed", () => {
      //console.log("accessAllowed");
    });
    // The user has denied access to the camera and mic.
    this.localStream.on("accessDenied", () => {
      //console.log("accessDenied");
    });

    this.localStream.init(() => {
      //console.log("getUserMedia successfully");
      this.localStream.play('agora_local');
      this.agoraService.client.publish(this.localStream, function (err) {
        //console.log("Publish local stream error: " + err);
      });
      this.agoraService.client.on('stream-published', function (evt) {
        //console.log("Publish local stream successfully");
      });
    }, function (err) {
      //console.log("getUserMedia failed", err);
    });

    // Add
    this.agoraService.client.on('error', (err) => {
      //console.log("Got error msg:", err.reason);
      if (err.reason === 'DYNAMIC_KEY_TIMEOUT') {
        this.agoraService.client.renewChannelKey("", () => {
          //console.log("Renew channel key successfully");
        }, (err) => {
          //console.log("Renew channel key failed: ", err);
        });
      }
    });

    // Add
    this.agoraService.client.on('stream-added', (evt) => {
      const stream = evt.stream;
      this.agoraService.client.subscribe(stream, (err) => {
        //console.log("Subscribe stream failed", err);
      });
    });

    // Add
    this.agoraService.client.on('stream-subscribed', (evt) => {
      const stream = evt.stream;
      this.startTimer();
      if (!this.remoteCalls.includes(`agora_remote${stream.getId()}`)) this.remoteCalls.push(`agora_remote${stream.getId()}`);
      setTimeout(() => stream.play(`agora_remote${stream.getId()}`), 2000);
    });

    // Add
    this.agoraService.client.on('stream-removed', (evt) => {
      const stream = evt.stream;
      stream.stop();
      this.remoteCalls = this.remoteCalls.filter(call => call !== `#agora_remote${stream.getId()}`);
      //console.log(`Remote stream is removed ${stream.getId()}`);
    });

    // Add
    this.agoraService.client.on('peer-leave', (evt) => {
      const stream = evt.stream;
      if (stream) {
        stream.stop();
        this.remoteCalls = this.remoteCalls.filter(call => call === `#agora_remote${stream.getId()}`);
        //console.log(`${evt.uid} left from this channel`);
      }
    });
  }
*/
  closeCall(reason) {
    //console.log("closing : ", reason);
    /*if (this.stream != null) {
      this.stream.getTracks().forEach((track) => {
        track.stop();
      });
    }*/
    this.ngxAgoraService.client.leave(() => {
      if(this.localStream != null){
        this.localStream.stop();
        this.localStream.close();
      }
    }, err=> {
      //console.log(err);
    });
    this.audio.pause();
    this.pauseTimer();
    this.afs.collection('calls').doc(this.call_obj.dataId).delete(/*{
      has_missed: 3,
      duration: this.transform(this.time)
    }*/)
      .then(
        res => {
          //this.peer.destroy();
          this.activeModal.dismiss(reason);
        }, err => {
          this.activeModal.dismiss(reason);
        });


  }


  answerCall(status) {
    const $this = this;
    this.afs.collection('calls').doc(this.call_obj.dataId).update({
      has_missed: status
    })
      .then(
        res => {
          if (status == 1) {
            //call accepted
            //console.log("hey");
            this.direction = "calling";
            this.audio.pause();
            this.startCall();
            /*this.peer.on('call', (call) => {
              navigator.mediaDevices.getUserMedia({video: true, audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false }}).then((stream) => {
                //console.log("camera granted");
                call.answer(stream); // Answer the call with an A/V stream.
                call.on('stream', (remoteStream) => {

                  this.startTimer();
                  //this.audio.pause();
                  //document.getElementById("audio").stop();
                  this.stream = stream;
                  $this.myVideo.nativeElement.srcObject = stream;// URL.createObjectURL(remoteStream);
                  setTimeout(function () {
                    $this.myVideo.nativeElement.play();
                  }, 300);
                  // Show stream in some <video> element.
                  //console.log(" receiver video streaming", remoteStream);
                  this.hisVideo.nativeElement.srcObject = remoteStream;// URL.createObjectURL(remoteStream);
                  //this.hisVideo.nativeElement.play();
                  setTimeout(function () {
                    //console.log("started play");
                    $this.hisVideo.nativeElement.play();
                    //console.log("started play");
                  }, 150);
                });
              }, (err) => {
                console.error('Failed to get local stream', err);
              });
            });*/
          } else {
            //call rejected
            this.api.handleErrors("Vous avez rejeté l'appel");
            this.closeCall("rejected");
          }
        },
        err => {

        }
      );

    /*this.api.performPATCHCall("calls/"+this.call_obj.id, {has_missed: status}, false, true).subscribe(res => {
      if (status == 1) {
        //call accepted
        //console.log("hey");
        this.direction = "calling";
        this.peer.on('call', (call) => {
          navigator.mediaDevices.getUserMedia({video: true, audio: true}).then((stream) => {
            //console.log("camera granted");
            call.answer(stream); // Answer the call with an A/V stream.
            call.on('stream', (remoteStream) => {

              $this.myVideo.nativeElement.srcObject = stream;// URL.createObjectURL(remoteStream);
              $this.myVideo.nativeElement.play();
              // Show stream in some <video> element.
              //console.log(" receiver video streaming");
              this.hisVideo.nativeElement.srcObject = remoteStream;// URL.createObjectURL(remoteStream);
              this.hisVideo.nativeElement.play();
            });
          }, (err) => {
            console.error('Failed to get local stream', err);
          });
        });
      } else {
        //call rejected
      }
    });*/
  }


  startTimer() {
    //console.log("=====>");
    this.interval = setInterval(() => {
      if (this.time === 0) {
        this.time++;
      } else {
        this.time++;
      }
      this.display = this.transform(this.time)
    }, 1000);
  }

  pauseTimer() {
    clearInterval(this.interval);
  }

  transform(value: number): string {
    var sec_num = value;
    var hours = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    //if (hours   < 10) {hours   = 0;}
    //if (minutes < 10) {minutes = 0;}
    //if (seconds < 10) {seconds = 0;}
    return this.api.addZeroToNumber(hours) + ':' + this.api.addZeroToNumber(minutes) + ':' + this.api.addZeroToNumber(seconds);
  }
}
