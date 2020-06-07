import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ChatsTabPage } from './chats-tab.page';

describe('ChatsTabPage', () => {
  let component: ChatsTabPage;
  let fixture: ComponentFixture<ChatsTabPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChatsTabPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ChatsTabPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
