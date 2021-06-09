import { Game } from './components/game';
import { Timer } from './components/timer';
import { Header } from './components/header';
import { About } from './pages/about-game';
import { ImageCategoryModel } from '../models/image-category-model';
import { Score } from './pages/score';
import { Settings } from './pages/settings';
import { Popup } from './components/popup';
import { WinMessage } from './components/win-message';
import globalState from '../shared/globalState';

export class App {
  private readonly userData = {
    name: '',
    surname: '',
    mail: '',
    img: '',
    score: 0,
  };

  private readonly game: Game;

  private readonly timer: Timer;

  private readonly header: Header;

  private readonly aboutPage: About;

  private readonly scorePage: Score;

  private readonly settingsPage: Settings;

  private readonly popup: Popup;

  private readonly winMessage: WinMessage;

  private request: IDBOpenDBRequest;

  constructor(private readonly rootElement: HTMLElement) {
    this.header = new Header();
    this.game = new Game();
    this.timer = new Timer();
    this.aboutPage = new About();
    this.scorePage = new Score();
    this.settingsPage = new Settings();
    this.popup = new Popup();
    this.winMessage = new WinMessage();
    this.request = indexedDB.open('AnzhelikaMikulich', 1);
    if (this.rootElement.innerHTML === '') {
      this.rootElement.appendChild(this.header.element);
      this.rootElement.appendChild(this.aboutPage.element);
      this.rootElement.appendChild(this.popup.element);
    }
  }

  addProfile = () => {
    const transaction = this.request.result.transaction(
      'profiles',
      'readwrite',
    );
    const store = transaction.objectStore('profiles');

    const person = {
      name: this.userData.name,
      email: this.userData.mail,
      surname: this.userData.surname,
      created: new Date(),
    };

    const request = store.add(person);

    request.onerror = function () {
      console.log('add Error');
    };

    request.onsuccess = function () {
      console.log('Woot! Did it');
    };
  };

  defineProfile = () => {
    this.userData.name = (<HTMLInputElement>(
      document.getElementById('formName')
    )).value;
    this.userData.surname = (<HTMLInputElement>(
      document.getElementById('formSurname')
    )).value;
    this.userData.mail = (<HTMLInputElement>(
      document.getElementById('formEmail')
    )).value;
  };

  changeCardSize = (size: number) => {
    let tempSpace;
    switch (size) {
      case 8:
        tempSpace = '1 0 22%';
        break;
      case 12.5:
        tempSpace = '1 0 18%';
        break;
      case 18:
        tempSpace = '1 0 13%';
        break;
      default:
        tempSpace = '1 0 22%';
        break;
    }
    document.documentElement.style.setProperty('--cardSpace', tempSpace);
  };

  initInput() {
    const sizeInput = (<HTMLInputElement> document.querySelector('#fieldType'));
    const typeInput = (<HTMLInputElement>document.querySelector('#cardType'));
    sizeInput.addEventListener('change', (e) => {
      globalState.settings.number = (Number(
        (<HTMLInputElement>e.target).value,
      ) * Number(
        (<HTMLInputElement>e.target).value,
      )) / 2;
      this.changeCardSize(globalState.settings.number);
    });
    typeInput.addEventListener('change', (e) => {
      console.log(typeInput.value);
      globalState.settings.type = Number(
        (<HTMLInputElement>e.target).value,
      );
    });
  }

  async startGame(): Promise<void> {
    const res = await fetch('./images.json');
    const categories: ImageCategoryModel[] = await res.json();
    const cat = categories[globalState.settings.type];
    const images = [];
    for (let i = 0; i < globalState.settings.number; i += 1) images.push(`${cat.category}/${cat.images[i]}`);
    this.game.newGame(images);
  }

  routing(): void {
    const routes = [
      {
        name: 'Score',
        component: () => {
          this.rootElement.innerHTML = '';
          this.rootElement.appendChild(this.header.element);
          this.rootElement.appendChild(this.scorePage.element);
          this.rootElement.appendChild(this.popup.element);
        },
      },
      {
        name: 'Settings',
        component: () => {
          this.rootElement.innerHTML = '';
          this.rootElement.appendChild(this.header.element);
          this.rootElement.appendChild(this.settingsPage.element);
          this.rootElement.appendChild(this.popup.element);
          this.initInput();
        },
      },
      {
        name: 'Play',
        component: () => {
          this.rootElement.innerHTML = '';
          this.rootElement.appendChild(this.header.element);
          this.rootElement.appendChild(this.timer.element);
          this.rootElement.appendChild(this.game.element);
          this.game.element.classList.add('field-wrapper');
          this.startGame();
          this.rootElement.appendChild(this.popup.element);
          this.rootElement.appendChild(this.winMessage.element);
          this.game.closeWin();
        },
      },
    ];

    const defaultRout = {
      name: 'default',
      component: () => {
        this.rootElement.innerHTML = '';
        this.rootElement.appendChild(this.header.element);
        this.rootElement.appendChild(this.aboutPage.element);
        this.rootElement.appendChild(this.popup.element);
      },
    };

    this.header.activeRout();
    window.onpopstate = () => {
      const currentRoutName = window.location.hash.slice(1);
      const currentRout = routes.find((rout) => rout.name === currentRoutName);

      (currentRout || defaultRout).component();
    };
  }

  registrPopup(): void {
    this.popup.showPopup();
    const addButton = document.querySelector('.add-button');
    const playSection = document.querySelector('.play-link');
    const registrButton = document.querySelector('.register-button');
    if (addButton) {
      addButton.addEventListener('click', () => {
        if (playSection) playSection.classList.remove('button-hidden');
        if (registrButton) registrButton.classList.add('button-hidden');
      });
    }
  }
}
