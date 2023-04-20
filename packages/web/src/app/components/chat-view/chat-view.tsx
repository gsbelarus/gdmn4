import styled from 'styled-components';
import { forwardRef, Fragment, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { NLPDialog } from '@gdmn-cz/types';
import { useCreateMessageMutation, useGetAllMessagesQuery } from '../../features/nlp/chatApi';

const NLPDialogContainer = styled.div`
  display: grid;
  grid-template-columns: auto;
  grid-template-rows: 1fr 120px;
  grid-gap: 0;
  padding: 0;
  margin: 0;
  font-size: 12px;
  width: 100%;
  height: 100%;
  text-align: left;
  background-color: aquamarine;
  overflow: hidden;
  border-radius: 4px;

  .NLPScrollBar {
    z-index: 10;
    display: block;
    position: absolute;
    height: 100%;
    width: 12px;
    top: 0;
    right: 0;
    background: inherit;
    border-radius: 4px;
  }

  .NLPScrollBarThumb {
    display: block;
    position: absolute;
    width: 100%;
    padding-top: 4px;
    padding-bottom: 4px;
    content: "";
    background: rgba(0, 0, 0, 0.2);
    border-radius: 5px;
  }

  .NLPScrollBar:hover {
    background: rgba(0, 0, 0, 0.2);
    transition: background 0.5s;
  }

  .NLPScrollBarVisible {
    z-index: 10;
    display: block;
    position: absolute;
    height: 100%;
    width: 12px;
    top: 0;
    right: 0;
    background: rgba(0, 0, 0, 0.2);
    transition: background 0.5s;
  }
`;

const NLPItems = styled.div`
  grid-column: 1;
  grid-row: 1;
  display: block;
  height: 100%;
  width: 100%;
  overflow: hidden;
  position: relative;
`;

const NLPItemsFlex = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  position: absolute;
  overflow: hidden;
  height: 100%;
  width: 100%;
`;

const NLPItem = styled.div`
  width: 100%;
  margin-left: 4px;
  margin-bottom: 12px;
  vertical-align: bottom;
  .Circle {
    display: inline-block;
    background-color: blueviolet;
    border-radius: 50%;
    width: 1.6em;
    line-height: 1.6em;
    text-align: center;
    vertical-align: middle;
    color: white;
    font-size: 12px;
    padding: 4px;
    margin-right: 8px;
    box-sizing: initial;
  }

  .MessageLeft {
    position: relative;
    display: inline-block;
    background-color: antiquewhite;
    border-radius: 6px 6px 6px 0;
    padding: 4px 8px;
    box-shadow: 0 2px 1px 0 rgba(93,196,82,.5);
    max-width: calc(100% - 4em);
  }

  .MessageRight {
    position: relative;
    display: inline-block;
    background-color: antiquewhite;
    border-radius: 6px 6px 6px 0;
    padding: 4px 8px;
    box-shadow: 2px 2px 1px 0 rgba(93,196,82,.5);
    max-width: calc(100% - 4em);
    margin-right: 8px;
  }

  .MessageLeft::before {
    position: absolute;
    content: '';
    bottom: -2px;
    left: -8px;
    width: 8px;
    height: 2px;
    background-color: rgba(93,196,82,.4);
    z-index: 1;
  }

  .MessageRight::before {
    position: absolute;
    content: '';
    bottom: -2px;
    right: -8px;
    width: 10px;
    height: 2px;
    background-color: rgba(93,196,82,.4);
    z-index: 1;
  }

  .MessageLeft::after {
    position: absolute;
    content: '';
    bottom: 0;
    left: -10px;
    width: 16px;
    height: 10px;
    clip-path: url(#left-droplet);
    background-color: inherit;
    z-index: 1;
  }

  .MessageRight::after {
    position: absolute;
    content: '';
    bottom: 0;
    right: -10px;
    width: 16px;
    height: 10px;
    clip-path: url(#right-droplet);
    background-color: inherit;
    z-index: 1;
  }
`;

const NLPInput = styled.textarea`
  grid-column: 1;
  grid-row: 2;
  margin: 4px;
  border: 1px solid gray;
  border-radius: 4px;
  padding: 4px;
  font-family: inherit;
  font-size: 12px;
  outline: none;
  background-color: white;
  resize: none;
`;

/* eslint-disable-next-line */
export interface ChatViewProps {
  nlpDialog: NLPDialog;
  push: (who: string, text: string) => void;
  info: {userId: string, chatId: string}
};

interface IChatInputProps {
  onInputText: (text: string) => void;
};

const topGap = 24;
const scrollTimerDelay = 4000;

interface IChatViewState {
  showFrom: number;
  showTo: number;
  partialOK: boolean;
  recalc: boolean;
  scrollVisible: boolean;
  scrollTimer: any;
  prevClientY?: number;
  prevFrac: number;
  prevNLPDialog: NLPDialog;
};

const defState: Omit<IChatViewState, 'prevNLPDialog'> = {
  showFrom: -1,
  showTo: -1,
  partialOK: true,
  recalc: true,
  scrollVisible: false,
  scrollTimer: undefined,
  prevClientY: -1,
  prevFrac: 0,
};

export function ChatView({ nlpDialog, push, info }: ChatViewProps) {
  const [state, setState] = useState<IChatViewState>({ ...defState, prevNLPDialog: nlpDialog });

  const shownItems = useRef<HTMLDivElement[]>([]);
  const scrollThumb = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef();

  const { showFrom, showTo, scrollTimer, prevClientY, prevFrac, recalc, partialOK, prevNLPDialog } = state;

  // fetch all messages every X seconds
  const {data: messages, isLoading} = useGetAllMessagesQuery({chatId: info.chatId}, {pollingInterval: 1000});

  shownItems.current = [];

  const ChatInput = forwardRef(({ onInputText }: IChatInputProps, ref) => {
    const [text, setText] = useState('');
    const [prevText, setPrevText] = useState('');
    const ta = useRef<HTMLTextAreaElement | null>(null);

    // send message (add message to DB)
    const [addMessage] = useCreateMessageMutation();

    useImperativeHandle(ref, () => ({
      setTextAndFocus: (text: string) => {
        setText(text); 
        ta.current?.focus();
      }
    }));

    const onInputPressEnter = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      const trimText = text.trim();

      if (e.key === 'Enter' && !e.shiftKey && trimText) {
        //addMessage({chatId: info.chatId, text: trimText, userId: info.userId, who: ""});
        console.log({chatId: info.chatId, text: trimText, userId: info.userId, who: ""})
        setText('');
        setPrevText(trimText);
        onInputText(trimText);
        e.preventDefault();
      }
    }, [text, prevText]);

    const onInputArrowUp = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      const trimText = text.trim();

      if (e.key === 'ArrowUp' && !trimText) {
        setText(prevText);
      }
    }, [text, prevText]);

    const onInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => setText(e.target.value), []);

    return (
      <NLPInput
        spellCheck={false}
        value={text}
        onKeyPress={onInputPressEnter}
        onKeyDown={onInputArrowUp}
        onChange={onInputChange}
        ref={ta}
        autoFocus
      />
    );
  });

  useEffect(() => {
    if (recalc || nlpDialog !== prevNLPDialog) {
      let sf = showFrom;
      let st = showTo;

      if (showFrom === -1 || showTo === -1) {
        sf = (showFrom === -1 && nlpDialog.length) ? nlpDialog.length - 1 : showFrom;
        st = (showTo === -1 && nlpDialog.length) ? nlpDialog.length - 1 : showTo;
      } else if (nlpDialog.length > prevNLPDialog.length) {
        if (st !== prevNLPDialog.length - 1) {
          sf = nlpDialog.length - 1;
        }
        st = nlpDialog.length - 1;
      } else if (nlpDialog.length < prevNLPDialog.length) {
        sf = nlpDialog.length - 1;
        st = nlpDialog.length - 1;
      }

      if (shownItems.current.length) {
        if (shownItems.current[0].offsetTop > topGap) {
          if (shownItems.current.length < nlpDialog.length && sf > 0) {
            setState(state => ({
              ...state,
              showFrom: sf - 1,
              showTo: st,
              recalc: true,
              prevNLPDialog: nlpDialog
            }));
          } else {
            setState(state => ({
              ...state,
              showFrom: sf,
              showTo: st,
              recalc: false,
              prevNLPDialog: nlpDialog
            }));
          }
        } else if (shownItems.current[0].offsetTop + shownItems.current[0].offsetHeight < 0 && sf < st) {
          setState(state => ({
            ...state,
            showFrom: sf + 1,
            showTo: st,
            recalc: true,
            prevNLPDialog: nlpDialog
          }));
        } else if (shownItems.current[0].offsetTop < 0 && !partialOK && !showFrom && showFrom < showTo) {
          setState(state => ({
            ...state,
            showFrom: sf,
            showTo: st - 1,
            recalc: false,
            prevNLPDialog: nlpDialog
          }));
        } else {
          setState(state => ({
            ...state,
            showFrom: sf,
            showTo: st,
            recalc: false,
            prevNLPDialog: nlpDialog
          }));
        }
      } else {
        setState(state => ({
          ...state,
          showFrom: 0,
          showTo: 0,
          recalc: false,
          prevNLPDialog: nlpDialog
        }));
      }
    }
  }, [nlpDialog, prevNLPDialog, recalc, partialOK, showFrom, showTo]);

  const onWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    const delayedScrollHide = () => ({
      scrollVisible: true,
      scrollTimer: setTimeout(() => setState(state => ({ ...state, scrollVisible: false, scrollTimer: undefined })), scrollTimerDelay)
    });

    if (scrollTimer) {
      clearTimeout(scrollTimer);
    }

    if (e.deltaY < 0) {
      if (showFrom > 0) {
        setState(state => ({
          ...state,
          showFrom: showFrom - 1,
          showTo: showTo - 1,
          partialOK: false,
          recalc: true,
          ...delayedScrollHide()
        }));
      } else {
        setState(state => ({
          ...state,
          partialOK: false,
          recalc: true,
          ...delayedScrollHide()
        }));
      }
    } else if (e.deltaY > 0 && showTo < nlpDialog.length - 1) {
      setState(state => ({
        ...state,
        showFrom: showFrom + 1,
        showTo: showTo + 1,
        partialOK: true,
        recalc: true,
        ...delayedScrollHide()
      }));
    } else {
      setState(state => ({
        ...state,
        ...delayedScrollHide()
      }));
    }
  }, [showFrom, showTo, scrollTimer]);

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();

    if (e.currentTarget === e.target && scrollThumb.current) {
      const above = e.clientY <= scrollThumb.current.getBoundingClientRect().top;
      const page = showTo - showFrom + 1;
      let newFrom: number;
      let newTo: number;

      if (above) {
        newFrom = showFrom - page;
        newTo = showTo - page;
      } else {
        newFrom = showFrom + page;
        newTo = showTo + page;
      }

      if (newFrom < 0) {
        newFrom = 0;
      }

      if (newFrom >= nlpDialog.length) {
        newFrom = nlpDialog.length - 1;
      }

      if (newTo < newFrom) {
        newTo = newFrom;
      }

      if (newTo >= nlpDialog.length) {
        newTo = nlpDialog.length - 1;
      }

      setState(state => ({
        ...state,
        showFrom: newFrom,
        showTo: newTo,
        partialOK: !above,
        recalc: true
      }));
    } else {
      e.currentTarget.setPointerCapture(e.pointerId);
      setState(state => ({
        ...state,
        scrollVisible: true,
        prevClientY: e.clientY,
        prevFrac: 0
      }));
    }
  }, [showFrom, showTo, nlpDialog]);

  const onPointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.releasePointerCapture(e.pointerId);

    if (scrollTimer) {
      clearTimeout(scrollTimer);
    }

    setState(state => ({
      ...state,
      scrollVisible: true,
      scrollTimer: setTimeout(() => setState(state => ({ ...state, scrollVisible: false, scrollTimer: undefined })), scrollTimerDelay),
      prevClientY: undefined,
      prevFrac: 0
    }));
  }, [scrollTimer]);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!(e.buttons === 1 && typeof prevClientY === 'number' && nlpDialog.length)) return;

    e.preventDefault();

    const deltaY = e.clientY - prevClientY;
    const deltaPrecise = deltaY / (e.currentTarget.clientHeight / nlpDialog.length);
    const deltaCorrected = deltaPrecise + prevFrac;
    const delta = Math.trunc(deltaCorrected);

    if (!delta) return;

    if (showFrom === 0 && delta < 0) {
      setState(state => ({
        ...state,
        partialOK: false,
        recalc: true
      }));
    } else {
      let newFrom = showFrom + delta;
      if (newFrom < 0) newFrom = 0;
      let newTo = showTo + delta;
      if (newTo >= nlpDialog.length) newTo = nlpDialog.length - 1;
      if (newFrom > newTo) newFrom = newTo;
      setState(state => ({
        ...state,
        showFrom: newFrom,
        showTo: newTo,
        partialOK: !!newFrom,
        recalc: true,
        prevClientY: e.clientY,
        prevFrac: deltaCorrected - delta
      }));
    }
  }, [nlpDialog, showFrom, showTo, prevClientY, prevFrac]);

  const onInputText = useCallback((text: string) => {
    setState(state => ({
      ...state,
      showFrom: -1,
      showTo: -1,
      partialOK: true,
      recalc: true
    }));
    push('me', text);
  }, [nlpDialog]);

  const sf = (showFrom === -1 && nlpDialog.length) ? nlpDialog.length - 1 : showFrom;
  const st = (showTo === -1 && nlpDialog.length) ? nlpDialog.length - 1 : showTo;

  const thumbHeight = nlpDialog.length ? `${Math.trunc(((st - sf + 1) / nlpDialog.length) * 100).toString()}%` : '100%';
  const thumbTop = nlpDialog.length ? `${Math.trunc((sf / nlpDialog.length) * 100).toString()}%` : '100%';

  return (
    <Fragment>
      <NLPDialogContainer>
        <NLPItems>
          <NLPItemsFlex onWheel={onWheel}>
            {nlpDialog.map(
              (i, idx) =>
                idx >= sf &&
                  idx <= st && (
                  <NLPItem
                    key={i.id}
                    style={ i.who === 'me' ? { textAlign: 'right', paddingRight: 12 } : { textAlign: 'left' } }
                    ref={elem => elem && shownItems.current.push(elem)}
                    onClick={() => {
                      if (inputRef.current) {
                        (inputRef.current as any).setTextAndFocus(i.text);
                      }
                    }}
                  >
                    {
                      i.who === 'me' ?
                        <>
                          <span className="Message MessageRight">{i.text}</span>
                          <span className="Circle">{i.who}</span>
                        </>
                        :
                        <>
                          <span className="Circle">{i.who}</span>
                          <span className="Message MessageLeft">{i.text}</span>
                        </>
                    }
                  </NLPItem>
                )
            )}
            <div
              className={state.scrollVisible ? 'NLPScrollBarVisible' : 'NLPScrollBar'}
              onPointerDown={onPointerDown}
              onPointerUp={onPointerUp}
              onPointerMove={onPointerMove}
            >
              <div
                className='NLPScrollBarThumb'
                style={{ height: thumbHeight, top: thumbTop }}
                ref={scrollThumb}
              />
            </div>
          </NLPItemsFlex>
        </NLPItems>
        <ChatInput onInputText={onInputText} ref={inputRef} />
      </NLPDialogContainer>
      <svg height="0" width="0">
        <defs>
          <clipPath id="left-droplet">
            <path d="M 10,0 A 10,10 0 0 1 0,10 H 16 V 0 Z" />
          </clipPath>
          <clipPath id="right-droplet">
            <path d="M 6,0 A 10,10 0 0 0 16,10 H 0 V 0 Z" />
          </clipPath>
        </defs>
      </svg>
    </Fragment>
  );
};

export default ChatView;
