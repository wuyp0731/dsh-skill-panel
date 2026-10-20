/**
 * Client half of the skill panel bundle.
 *
 * The sidebar gets one global panel button whose id addresses the matching
 * `main` panel; clicking it opens a page that lists every skill visible to the
 * active session through the Host `skills` Remote namespace.
 */
window.__ModuleLoader__.load({
  id: 'dsh-skill-panel',
  factory(require) {
    const React = require('react');
    const h = React.createElement;

    const NS = 'skill-panel';

    /** Simplified Chinese dictionary (the key-set source of truth). */
    const zh = {
      'panel.label': '技能',
      'panel.title': '技能',
      'panel.subtitle': '当前会话可见的全部技能',
      'panel.refresh': '刷新',
      'panel.searchAria': '筛选技能',
      'panel.searchPlaceholder': '按名称或描述筛选',
      'panel.loading': '正在读取技能目录…',
      'panel.errorTitle': '读取技能目录失败',
      'panel.retry': '重试',
      'panel.empty': '当前会话没有可见的技能。',
      'panel.emptyFiltered': '没有匹配的技能。',
      'panel.noSession': '打开或选择一个会话后，即可在这里查看技能。',
      'panel.countUnit': '个技能',
      'panel.userOnly': '仅用户',
      'panel.session': '会话',
      'section.preset': '预设技能',
      'section.mine': '我的技能',
    };

    /** English dictionary, checked complete against the zh key set. */
    const en = {
      'panel.label': 'Skills',
      'panel.title': 'Skills',
      'panel.subtitle': 'Every skill visible to the active session',
      'panel.refresh': 'Refresh',
      'panel.searchAria': 'Filter skills',
      'panel.searchPlaceholder': 'Filter by name or description',
      'panel.loading': 'Reading the skill catalog…',
      'panel.errorTitle': 'Could not read the skill catalog',
      'panel.retry': 'Retry',
      'panel.empty': 'This session has no visible skills.',
      'panel.emptyFiltered': 'No skills match the filter.',
      'panel.noSession': 'Open or select a session to list its skills here.',
      'panel.countUnit': 'skills',
      'panel.userOnly': 'user-only',
      'panel.session': 'Session',
      'section.preset': 'Preset skills',
      'section.mine': 'My skills',
    };

    const CSS = `
.dsh-sp-panel{display:flex;flex-direction:column;height:100%;min-height:0;box-sizing:border-box;padding:24px 28px 32px;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);overflow-y:auto}
.dsh-sp-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;flex:none}
.dsh-sp-headText{min-width:0}
.dsh-sp-title{margin:0;font-size:20px;font-weight:600;line-height:1.3}
.dsh-sp-subtitle{margin:4px 0 0;font-size:13px;line-height:1.5;color:var(--dsw-alias-label-secondary);overflow-wrap:anywhere}
.dsh-sp-button{flex:none;height:28px;padding:0 12px;border-radius:6px;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font-family:inherit;font-size:13px;line-height:1;cursor:pointer;transition:background .1s}
.dsh-sp-button:hover{background:var(--dsw-alias-bg-layer-2)}
.dsh-sp-button:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px}
.dsh-sp-toolbar{display:flex;align-items:center;gap:12px;margin:16px 0 0;flex:none}
.dsh-sp-search{flex:auto;min-width:0;height:32px;padding:0 10px;border-radius:6px;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font-family:inherit;font-size:13px;outline:none}
.dsh-sp-search::placeholder{color:var(--dsw-alias-label-secondary)}
.dsh-sp-search:focus{border-color:var(--dsw-alias-brand-primary)}
.dsh-sp-count{flex:none;font-size:12px;color:var(--dsw-alias-label-secondary);white-space:nowrap}
.dsh-sp-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column}
.dsh-sp-item{padding:14px 0;border-top:1px solid var(--dsw-alias-border-l1)}
.dsh-sp-item:first-child{border-top:none}
.dsh-sp-cards{display:flex;flex-direction:column;gap:12px;margin:18px 0 0;flex:none}
.dsh-sp-card{border:1px solid var(--dsw-alias-border-l1);border-radius:8px;background:var(--dsw-alias-bg-layer-1);overflow:hidden}
.dsh-sp-cardHead{display:flex;align-items:center;gap:10px;width:100%;box-sizing:border-box;padding:12px 14px;border:none;background:transparent;color:var(--dsw-alias-label-primary);font-family:inherit;font-size:13px;font-weight:600;line-height:1.4;text-align:left;cursor:pointer;transition:background .1s}
.dsh-sp-cardHead:hover{background:var(--dsw-alias-bg-layer-2)}
.dsh-sp-cardHead:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:-2px}
.dsh-sp-cardTitle{flex:none}
.dsh-sp-cardCount{display:inline-flex;align-items:center;justify-content:center;min-width:20px;height:20px;padding:0 6px;box-sizing:border-box;border-radius:10px;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-secondary);font-size:11px;font-weight:500;line-height:1}
.dsh-sp-chevron{margin-left:auto;display:inline-flex;color:var(--dsw-alias-label-secondary);transition:transform .15s}
.dsh-sp-card[data-open="true"] .dsh-sp-chevron{transform:rotate(90deg)}
.dsh-sp-cardBody{border-top:1px solid var(--dsw-alias-border-l1);padding:0 14px 4px}
.dsh-sp-cardEmpty{margin:0;padding:16px 0;font-size:13px;line-height:1.6;color:var(--dsw-alias-label-secondary)}
.dsh-sp-itemHead{display:flex;align-items:center;gap:8px;min-width:0;flex-wrap:wrap}
.dsh-sp-name{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:13px;font-weight:600;color:var(--dsw-alias-brand-primary);overflow-wrap:anywhere}
.dsh-sp-chip{display:inline-flex;align-items:center;height:20px;padding:0 8px;border-radius:10px;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-secondary);font-size:11px;line-height:1;white-space:nowrap}
.dsh-sp-desc{margin:6px 0 0;font-size:13px;line-height:1.6;color:var(--dsw-alias-label-secondary);overflow-wrap:anywhere}
.dsh-sp-when{margin:4px 0 0;font-size:12px;line-height:1.6;color:var(--dsw-alias-label-secondary);opacity:.85;overflow-wrap:anywhere}
.dsh-sp-path{margin:6px 0 0;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11px;line-height:1.5;color:var(--dsw-alias-label-secondary);opacity:.72;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dsh-sp-state{margin:24px 0 0;padding:24px 0;text-align:center;font-size:13px;line-height:1.6;color:var(--dsw-alias-label-secondary);overflow-wrap:anywhere}
.dsh-sp-state[data-tone="error"]{color:var(--dsw-alias-state-error-primary)}
.dsh-sp-errorBox{display:flex;flex-direction:column;align-items:center;gap:12px}
`;

    /**
     * Resolve a human-readable message for a rejected Remote or session read.
     * @param error - any thrown value.
     * @returns the message text.
     */
    function errorMessage(error) {
      if (error instanceof Error && error.message !== '') return error.message;
      if (typeof error === 'string' && error !== '') return error;
      return String(error);
    }

    /**
     * Find the Session the main Conversation currently holds.
     * @param rows - session rows from the workspace list snapshot.
     * @returns the main-view row or undefined.
     */
    function mainViewRow(rows) {
      return rows.find((row) => ((row.retainedBy && row.retainedBy.mainView) || 0) > 0);
    }

    /**
     * Choose the Session whose catalog the panel shows.
     * @param rows - session rows from the workspace list snapshot.
     * @param remembered - the Session the main view held before this panel opened.
     * @returns the selected row or undefined.
     */
    function pickSession(rows, remembered) {
      const mainView = mainViewRow(rows);
      if (mainView !== undefined) return mainView;
      if (remembered !== undefined) {
        const kept = rows.find((row) => row.id === remembered);
        if (kept !== undefined) return kept;
      }
      return rows.find((row) => {
        const retained = row.retainedBy;
        if (retained === undefined || retained === null) return false;
        return Object.keys(retained).some((source) => (retained[source] || 0) > 0);
      });
    }

    /**
     * Normalize one filesystem path for prefix comparison.
     * @param value - a path with either separator spelling.
     * @returns a lowercase slash-separated path without a trailing separator.
     */
    function normalizePath(value) {
      return String(value).replace(/\\/g, '/').replace(/\/+$/, '').toLowerCase();
    }

    /**
     * Resolve the absolute root that holds the user's own skills.
     * @param remote - the Client Remote namespace carrying Host facts.
     * @returns the candidate roots, empty when the Host home is unknown.
     */
    function userSkillRoots(remote) {
      const facts = remote && remote.$host ? remote.$host : undefined;
      const home = facts ? facts.home : undefined;
      if (typeof home !== 'string' || home === '') return [];
      const normalized = normalizePath(home);
      if (normalized === '') return [];
      if (/\/\.dsh$/.test(normalized)) return [`${normalized}/skills`];
      return [`${normalized}/.dsh/skills`];
    }

    /**
     * Whether one skill lives under the user's own skill root.
     * @param path - the skill's instruction-file path.
     * @param roots - absolute roots from {@link userSkillRoots}.
     * @returns true for a user-owned skill.
     */
    function isUserSkill(path, roots) {
      if (typeof path !== 'string' || path === '') return false;
      const normalized = normalizePath(path);
      if (roots.length === 0) return /\/\.dsh\/skills\//.test(normalized);
      return roots.some((root) => normalized === root || normalized.startsWith(`${root}/`));
    }

    /**
     * Describe an unavailable Session open state.
     * @param snapshot - the retained session snapshot.
     * @param sessionId - the session being inspected.
     * @returns the message for the thrown error.
     */
    function closedSessionMessage(snapshot, sessionId) {
      const detail = snapshot.openError;
      if (detail === null || detail === undefined) return `session "${sessionId}" is not open`;
      if (typeof detail === 'string') return detail;
      const message = typeof detail.message === 'string' ? detail.message : '';
      const code = typeof detail.code === 'string' ? detail.code : '';
      if (message !== '') return code === '' ? message : `${code}: ${message}`;
      return `session "${sessionId}" is not open`;
    }

    /**
     * Render the sidebar cell: a star whose stroke inherits the owner color.
     * @param props - the sidebar panel row's size and selected state.
     * @returns the icon element.
     */
    function SkillIcon(props) {
      const size = props.size || 18;
      const active = props.active === true;
      return h(
        'svg',
        {
          width: size,
          height: size,
          viewBox: '0 0 24 24',
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: active ? 1.9 : 1.7,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          'aria-hidden': true,
          style: { display: 'block', overflow: 'visible' },
        },
        h(
          'g',
          { transform: 'translate(12 12) scale(1.18) translate(-12 -12)' },
          h('path', { d: 'M12 3.6l2.5 5.2 5.7.8-4.1 4 1 5.7-5.1-2.7-5.1 2.7 1-5.7-4.1-4 5.7-.8z' }),
          h('circle', { cx: 12, cy: 11.4, r: 1.7, fill: 'currentColor', stroke: 'none' }),
        ),
      );
    }

    return {
      inject: ['slots', 'sessions', 'remote', 'remote.skills', 'locale'],
      apply(ctx) {
        const t = ctx.locale.bind(NS);
        const sessions = ctx.sessions;
        const skillsRemote = ctx.remote.skills;
        const userRoots = userSkillRoots(ctx.remote);

        ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'skill-panel: dictionaries');

        /**
         * Render the skill catalog panel.
         * @returns the catalog page.
         */
        function SkillPanel() {
          const workspace = React.useSyncExternalStore(
            React.useCallback((listen) => sessions.list.subscribe(listen), [sessions]),
            React.useCallback(() => sessions.list.getSnapshot(), [sessions]),
          );
          const rows = workspace && workspace.byId ? Object.values(workspace.byId) : [];
          const remembered = React.useRef(undefined);
          const current = mainViewRow(rows);
          if (current !== undefined) remembered.current = current.id;
          const session = pickSession(rows, remembered.current);
          const sessionId = session === undefined ? undefined : session.id;
          const cwd = session === undefined ? undefined : session.cwd;

          const [reload, setReload] = React.useState(0);
          const [query, setQuery] = React.useState('');
          const [state, setState] = React.useState({ status: 'idle', skills: [] });
          const [activeSection, setActiveSection] = React.useState('mine');

          React.useEffect(() => {
            if (sessionId === undefined) {
              setState({ status: 'no-session', skills: [] });
              return undefined;
            }
            const abort = new AbortController();
            let cancelled = false;
            setState({ status: 'loading', skills: [] });
            (async () => {
              try {
                const listed = await sessions.using(
                  sessionId,
                  { source: 'skillCatalog', signal: abort.signal },
                  async (reference) => {
                    const snapshot = reference.binding.session.getSnapshot();
                    if (snapshot.openState !== 'open') {
                      throw new Error(closedSessionMessage(snapshot, sessionId));
                    }
                    const result = await skillsRemote.list({ sessionId }, abort.signal);
                    if (!result.ok) {
                      throw new Error(`${result.error.code}: ${result.error.message}`);
                    }
                    return result.value.skills;
                  },
                );
                if (!cancelled) setState({ status: 'ready', skills: listed });
              } catch (error) {
                if (!cancelled && !abort.signal.aborted) {
                  setState({ status: 'error', skills: [], message: errorMessage(error) });
                }
              }
            })();
            return () => {
              cancelled = true;
              abort.abort();
            };
          }, [sessionId, reload]);

          const normalizedQuery = query.trim().toLowerCase();
          const filtered =
            normalizedQuery === ''
              ? state.skills
              : state.skills.filter((skill) => {
                  const haystack = `${skill.name}\n${skill.description}\n${skill.whenToUse || ''}`.toLowerCase();
                  return haystack.includes(normalizedQuery);
                });

          const header = h(
            'header',
            { className: 'dsh-sp-head' },
            h(
              'div',
              { className: 'dsh-sp-headText' },
              h('h1', { className: 'dsh-sp-title' }, t('panel.title')),
              h(
                'p',
                { className: 'dsh-sp-subtitle' },
                t('panel.subtitle'),
                sessionId === undefined
                  ? ''
                  : ` · ${t('panel.session')} ${session.title && session.title.trim() !== '' ? session.title.trim() : sessionId}${cwd ? ` · ${cwd}` : ''}`,
              ),
            ),
            h(
              'button',
              {
                type: 'button',
                className: 'dsh-sp-button',
                onClick: () => setReload((value) => value + 1),
              },
              t('panel.refresh'),
            ),
          );

          if (state.status === 'no-session') {
            return h(
              'div',
              { className: 'dsh-sp-panel' },
              h('style', null, CSS),
              header,
              h('p', { className: 'dsh-sp-state' }, t('panel.noSession')),
            );
          }

          if (state.status === 'loading' || state.status === 'idle') {
            return h(
              'div',
              { className: 'dsh-sp-panel' },
              h('style', null, CSS),
              header,
              h('p', { className: 'dsh-sp-state' }, t('panel.loading')),
            );
          }

          if (state.status === 'error') {
            return h(
              'div',
              { className: 'dsh-sp-panel' },
              h('style', null, CSS),
              header,
              h(
                'div',
                { className: 'dsh-sp-state dsh-sp-errorBox', 'data-tone': 'error' },
                h('span', null, `${t('panel.errorTitle')}: ${state.message}`),
                h(
                  'button',
                  {
                    type: 'button',
                    className: 'dsh-sp-button',
                    onClick: () => setReload((value) => value + 1),
                  },
                  t('panel.retry'),
                ),
              ),
            );
          }

          const renderSkill = (skill) => {
            return h(
              'li',
              { className: 'dsh-sp-item', key: skill.name },
              h(
                'div',
                { className: 'dsh-sp-itemHead' },
                h('span', { className: 'dsh-sp-name' }, `/${skill.name}`),
                skill.modelInvocable ? null : h('span', { className: 'dsh-sp-chip' }, t('panel.userOnly')),
              ),
              h('p', { className: 'dsh-sp-desc' }, skill.description),
              skill.whenToUse ? h('p', { className: 'dsh-sp-when' }, skill.whenToUse) : null,
              skill.path ? h('p', { className: 'dsh-sp-path', title: skill.path }, skill.path) : null,
            );
          };

          const renderSection = (id, title, skills, emptyText) => {
            const open = activeSection === id;
            const bodyId = `dsh-sp-section-${id}`;
            return h(
              'section',
              { className: 'dsh-sp-card', key: id, 'data-open': open ? 'true' : undefined },
              h(
                'button',
                {
                  type: 'button',
                  className: 'dsh-sp-cardHead',
                  'aria-expanded': open,
                  'aria-controls': bodyId,
                  onClick: () => setActiveSection(open ? null : id),
                },
                h('span', { className: 'dsh-sp-cardTitle' }, title),
                h('span', { className: 'dsh-sp-cardCount' }, String(skills.length)),
                h(
                  'span',
                  { className: 'dsh-sp-chevron', 'aria-hidden': true },
                  h(
                    'svg',
                    {
                      width: 14,
                      height: 14,
                      viewBox: '0 0 16 16',
                      fill: 'none',
                      stroke: 'currentColor',
                      strokeWidth: 1.6,
                      strokeLinecap: 'round',
                      strokeLinejoin: 'round',
                    },
                    h('path', { d: 'M6 3l5 5-5 5' }),
                  ),
                ),
              ),
              open
                ? h(
                    'div',
                    { className: 'dsh-sp-cardBody', id: bodyId },
                    skills.length === 0
                      ? h('p', { className: 'dsh-sp-cardEmpty' }, emptyText)
                      : h('ul', { className: 'dsh-sp-list' }, skills.map(renderSkill)),
                  )
                : null,
            );
          };

          const presetSkills = filtered.filter((skill) => !isUserSkill(skill.path, userRoots));
          const mySkills = filtered.filter((skill) => isUserSkill(skill.path, userRoots));
          const emptyText = normalizedQuery === '' ? t('panel.empty') : t('panel.emptyFiltered');

          const cards = h(
            'div',
            { className: 'dsh-sp-cards' },
            renderSection('preset', t('section.preset'), presetSkills, emptyText),
            renderSection('mine', t('section.mine'), mySkills, emptyText),
          );

          return h(
            'div',
            { className: 'dsh-sp-panel' },
            h('style', null, CSS),
            header,
            h(
              'div',
              { className: 'dsh-sp-toolbar' },
              h('input', {
                className: 'dsh-sp-search',
                type: 'search',
                value: query,
                placeholder: t('panel.searchPlaceholder'),
                'aria-label': t('panel.searchAria'),
                onChange: (event) => setQuery(event.target.value),
              }),
              h('span', { className: 'dsh-sp-count' }, `${filtered.length} ${t('panel.countUnit')}`),
            ),
            cards,
          );
        }

        ctx.slots.inject('sidebar.panellist', () =>
          ctx.slots.register(
            {
              name: 'sidebar.panellist',
              id: 'skills',
              order: 5,
              label: () => t('panel.label'),
            },
            SkillIcon,
          ),
        );

        ctx.slots.inject('main', () =>
          ctx.slots.register(
            {
              name: 'main',
              key: 'skills',
            },
            SkillPanel,
          ),
        );
      },
    };
  },
});
