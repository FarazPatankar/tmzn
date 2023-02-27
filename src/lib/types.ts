export type Config = {
  notionApiToken: string;
  notionDatabaseId: string;
};

export type Member = {
  Name: {
    title: {
      plain_text: string;
    }[];
  };
  Image: {
    files: {
      file: {
        url: string;
      };
    }[];
  };
  tz: {
    rich_text: {
      plain_text: string;
    }[];
  };
};

export type ResponseData = {
  results: {
    properties: Member;
  }[];
};
