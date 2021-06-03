import { BaseComponent } from "./base-component";

export class Output extends BaseComponent {
  constructor(value: string, id: string) {
    super("output", ["output"]);
    (<HTMLOutputElement>this.element).value = value;
    (<HTMLOutputElement>this.element).id = id;
  }
}
