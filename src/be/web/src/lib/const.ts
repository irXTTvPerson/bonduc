export const accountSelector = `
  a.screen_name as to_screen_name,
  a.identifier_name as to_identifier_name,
  a.created_at as to_created_at,
  a.header_url as to_header_url,
  a.icon_url as to_icon_url,
  b.screen_name as from_screen_name,
  b.identifier_name as from_identifier_name,
  b.created_at as from_created_at,
  b.header_url as from_header_url,
  b.icon_url as from_icon_url,
`;

export const buildAccountFromTo = (i: any, identifier_name: string) => {
  return {
    from: {
      identifier_name: i.from_identifier_name,
      screen_name: i.from_screen_name,
      created_at: i.from_created_at,
      header_url: i.from_header_url,
      icon_url: i.from_icon_url,
      is_me: identifier_name === i.from_identifier_name
    },
    to: {
      identifier_name: i.to_identifier_name,
      screen_name: i.to_screen_name,
      created_at: i.to_created_at,
      header_url: i.to_header_url,
      icon_url: i.to_icon_url,
      is_me: identifier_name === i.to_identifier_name
    }
  };
};
