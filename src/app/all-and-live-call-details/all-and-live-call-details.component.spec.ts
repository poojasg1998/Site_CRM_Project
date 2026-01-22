import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AllAndLiveCallDetailsComponent } from './all-and-live-call-details.component';

describe('AllAndLiveCallDetailsComponent', () => {
  let component: AllAndLiveCallDetailsComponent;
  let fixture: ComponentFixture<AllAndLiveCallDetailsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AllAndLiveCallDetailsComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AllAndLiveCallDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
