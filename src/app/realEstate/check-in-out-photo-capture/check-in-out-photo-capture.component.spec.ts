import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CheckInOutPhotoCaptureComponent } from './check-in-out-photo-capture.component';

describe('CheckInOutPhotoCaptureComponent', () => {
  let component: CheckInOutPhotoCaptureComponent;
  let fixture: ComponentFixture<CheckInOutPhotoCaptureComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CheckInOutPhotoCaptureComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CheckInOutPhotoCaptureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
