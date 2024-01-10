import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './includes/navbar/navbar.component';
import { FooterComponent } from './includes/footer/footer.component';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterUserComponent } from './pages/register-user/register-user.component';
import { RegisterDoctorComponent } from './pages/register-doctor/register-doctor.component';
import { NgbDatepicker, NgbDropdown, NgbModal, NgbModule, NgbNav, NgbPaginationModule, NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import '@angular/localize/init';
import { HelpComponent } from './pages/help/help.component';
import { ToastrModule } from "ngx-toastr";
import { NgxSpinnerModule } from "ngx-spinner";
import { HttpClientModule } from "@angular/common/http";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { AppointmentsComponent } from './pages/appointments/appointments.component';
import { BookAppointmentComponent } from './pages/book-appointment/book-appointment.component';
import { DocumentsComponent } from './pages/documents/documents.component';
import { SearchResultsComponent } from './pages/search-results/search-results.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { AddMetaComponent } from './pages/add-meta/add-meta.component';
import { SetCalendarComponent } from './pages/set-calendar/set-calendar.component';
import { CalendarComponent } from './pages/calendar/calendar.component';
import { PaymentComponent } from './pages/payment/payment.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { AgmCoreModule } from '@agm/core';

import { DoctorRegisteredComponent } from './pages/doctor-registered/doctor-registered.component';

// a plugin Full Calendar
import { FullCalendarModule } from "@fullcalendar/angular";

import { AppointmentSentComponent } from './pages/appointment-sent/appointment-sent.component';
import { EventDetailsComponent } from './pages/calendar/event-details/event-details.component';
import { PaymentMethodsComponent } from './pages/payment-methods/payment-methods.component';
import { AddAvailabilityComponent } from './pages/set-calendar/add-availability/add-availability.component';
import { NgxPayPalModule } from "ngx-paypal";

import { CallWindowComponent } from './pages/call-window/call-window.component';
import { CallWindowPatientComponent } from './pages/call-window-patient/call-window-patient.component';

import { environment } from "../environments/environment";

// AngularFire Modules
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { AngularFireStorageModule } from '@angular/fire/compat/storage';
import { AngularFireMessagingModule } from '@angular/fire/compat/messaging';

import { NgIdleKeepaliveModule } from "@ng-idle/keepalive";
import { EditProfileComponent } from './pages/profile/edit-profile/edit-profile.component';
import { ConfirmDeleteMetaComponent } from './pages/profile/edit-profile/confirm-delete-meta/confirm-delete-meta.component';
import { PasswordResetComponent } from './pages/password-reset/password-reset.component';
import { ChangePasswordComponent } from './pages/change-password/change-password.component';
import { CarreersComponent } from './pages/carreers/carreers.component';
import { AboutUsComponent } from './pages/about-us/about-us.component';
import { MediaComponent } from './pages/media/media.component';
import { ConfirmAccountComponent } from './pages/confirm-account/confirm-account.component';
import { CountdownModule, CountdownGlobalConfig, CountdownConfig } from "ngx-countdown";
import { CalendarModule, DateAdapter } from "angular-calendar";
import { ChangePasswordPhoneComponent } from './pages/change-password-phone/change-password-phone.component';
import { PrescriptionComponent } from './pages/prescription/prescription.component';
import { MakePrescriptionComponent } from './pages/prescription/make-prescription/make-prescription.component';
import { PrescriptionDetailComponent } from './pages/prescription/prescription-detail/prescription-detail.component';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';

import { AgoraConfig, AngularAgoraRtcModule } from "angular-agora-rtc";
import { NgxAgoraModule } from "ngx-agora";
import { RelaunchComponent } from './pages/relaunch/relaunch.component';
import { PatientRecordComponent } from './pages/patient-record/patient-record.component';
import { PatientMenuComponent } from './pages/patient-record/patient-menu/patient-menu.component';
import { ListPrescriptionComponent } from './pages/prescription/list-prescription/list-prescription.component';

//import {NgxIntlTelInputModule} from "ngx-intl-tel-input";
// @ts-ignore

const agoraConfig: AgoraConfig = {
  AppID: '7ff7d1c9d3f3402eabf1819baa3d6343',
};

export function countdownConfigFactory(): CountdownConfig {
  return {};
}

// @ts-ignore
// @ts-ignore
@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    FooterComponent,
    HomeComponent,
    LoginComponent,
    RegisterUserComponent,
    RegisterDoctorComponent,
    HelpComponent,
    AppointmentsComponent,
    BookAppointmentComponent,
    DocumentsComponent,
    SearchResultsComponent,
    SettingsComponent,
    ProfileComponent,
    AddMetaComponent,
    SetCalendarComponent,
    CalendarComponent,
    PaymentComponent,
    DoctorRegisteredComponent,
    AppointmentSentComponent,
    EventDetailsComponent,
    PaymentMethodsComponent,
    AddAvailabilityComponent,
    CallWindowComponent,
    CallWindowPatientComponent,
    EditProfileComponent,
    ConfirmDeleteMetaComponent,
    PasswordResetComponent,
    ChangePasswordComponent,
    CarreersComponent,
    AboutUsComponent,
    MediaComponent,
    ConfirmAccountComponent,
    ChangePasswordPhoneComponent,
    PrescriptionComponent,
    MakePrescriptionComponent,
    PrescriptionDetailComponent,
    RelaunchComponent,
    PatientRecordComponent,
    PatientMenuComponent,
    ListPrescriptionComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    NgbModule,
    FormsModule,
    NgxSpinnerModule,
    HttpClientModule,
    ToastrModule.forRoot(),
    FullCalendarModule,
    NgIdleKeepaliveModule.forRoot(),
    NgbPaginationModule,
    NgbCollapseModule,
    NgxPaginationModule,
    CountdownModule,
    NgxPayPalModule,
    ReactiveFormsModule,
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory,
    }),
    //NgxIntlTelInputModule,

    NgxAgoraModule.forRoot({AppID:"7ff7d1c9d3f3402eabf1819baa3d6343"}),
    AngularAgoraRtcModule.forRoot(agoraConfig),

    AngularFireModule.initializeApp(environment.firebase),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    AngularFirestoreModule,
    AngularFireStorageModule,
    AngularFireMessagingModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyC4c9IP1Tr0NyNr07YE-hCIKgWqCcJxdpA'
    }),
    AppRoutingModule,
  ],
  providers: [
    NgbDropdown,
    NgbDatepicker,
    //Peer,
    NgbModal,
    NgbNav,
    { provide: CountdownGlobalConfig, useFactory: countdownConfigFactory }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
