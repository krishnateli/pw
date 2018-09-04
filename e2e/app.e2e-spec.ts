import { PublicationPage } from './app.po';

describe('publication App', () => {
  let page: PublicationPage;

  beforeEach(() => {
    page = new PublicationPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
