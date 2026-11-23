import { formatYears, stripHtml } from '../src/utils/text';

describe('stripHtml', () => {
  it('removes tags and keeps paragraphs apart', () => {
    expect(
      stripHtml('<p><b>Breaking Bad</b> is a show.</p><p>Second.</p>'),
    ).toBe('Breaking Bad is a show.\n\nSecond.');
  });

  it('decodes common entities', () => {
    expect(stripHtml('Tom &amp; Jerry&#39;s &quot;best&quot;')).toBe(
      'Tom & Jerry\'s "best"',
    );
  });

  it('handles empty input', () => {
    expect(stripHtml(null)).toBe('');
    expect(stripHtml('')).toBe('');
  });
});

describe('formatYears', () => {
  it('shows a range for ended shows', () => {
    expect(
      formatYears({
        premiered: '2008-01-20',
        ended: '2013-09-29',
        status: 'Ended',
      }),
    ).toBe('2008 – 2013');
  });

  it('shows a single year when start and end match', () => {
    expect(
      formatYears({
        premiered: '2019-03-01',
        ended: '2019-11-01',
        status: 'Ended',
      }),
    ).toBe('2019');
  });

  it('marks running shows', () => {
    expect(
      formatYears({ premiered: '2019-03-01', ended: null, status: 'Running' }),
    ).toBe('2019 – now');
  });

  it('returns empty when there is no premiere date', () => {
    expect(
      formatYears({ premiered: null, ended: null, status: 'In Development' }),
    ).toBe('');
  });
});
