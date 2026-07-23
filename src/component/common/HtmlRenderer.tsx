import React, {useCallback, useMemo, useState} from 'react';
import {Linking, Platform, StyleProp, StyleSheet, View, ViewStyle} from 'react-native';
import RenderHTML, {
  CustomRendererProps,
  MixedStyleDeclaration,
  TPhrasing,
  TText,
  defaultSystemFonts,
} from 'react-native-render-html';
import TableRenderer, {tableModel} from '@native-html/table-plugin';
import {WebView} from 'react-native-webview';
import {recoverDoubleEscapedHtml} from '../htmlUtils';

export type HtmlRendererVariant = 'light' | 'dark';

interface HtmlRendererProps {
  /** Raw HTML string from the API. Double-escaped admin content is recovered automatically. */
  html: string;
  /** `light` for white/light-card surfaces (legal pages), `dark` for the navy FAQ cards. */
  variant?: HtmlRendererVariant;
  /** Horizontal padding around the rendered content. Pass 0 when the parent already pads. */
  containerPadding?: number;
  /** Override the auto-detected (window width minus padding) content width. */
  contentWidth?: number;
  style?: StyleProp<ViewStyle>;
}

interface HtmlPalette {
  text: string;
  heading: string;
  muted: string;
  link: string;
  border: string;
  surface: string;
  codeBackground: string;
  tableHeaderBg: string;
  tableRowAltBg: string;
}

const PALETTE: Record<HtmlRendererVariant, HtmlPalette> = {
  light: {
    text: '#222222',
    heading: '#111111',
    muted: '#5B6178',
    link: '#2F6FED',
    border: '#E5E7EB',
    surface: '#F6F8FC',
    codeBackground: '#F1F3F8',
    tableHeaderBg: '#F3F4F6',
    tableRowAltBg: '#FAFBFC',
  },
  dark: {
    text: '#C7CEF2',
    heading: '#FFFFFF',
    muted: '#8B93C4',
    link: '#7FB1FF',
    border: 'rgba(255,255,255,0.14)',
    surface: 'rgba(255,255,255,0.06)',
    codeBackground: 'rgba(255,255,255,0.08)',
    tableHeaderBg: 'rgba(255,255,255,0.08)',
    tableRowAltBg: 'rgba(255,255,255,0.03)',
  },
};

const SYSTEM_FONTS = [...defaultSystemFonts, 'System'];
const MONOSPACE_FONT = Platform.select({ios: 'Menlo', android: 'monospace', default: 'monospace'});

const DEFAULT_TEXT_PROPS = {
  selectable: false,
  allowFontScaling: true,
  maxFontSizeMultiplier: 1.3,
};

/** Underlines links only while pressed, keeping brand-blue color at rest. */
const PressableAnchorRenderer = ({
  TDefaultRenderer,
  textProps,
  ...props
}: CustomRendererProps<TText | TPhrasing>) => {
  const [pressed, setPressed] = useState(false);

  const onPressIn = useCallback(
    (e: any) => {
      setPressed(true);
      textProps?.onPressIn?.(e);
    },
    [textProps],
  );
  const onPressOut = useCallback(
    (e: any) => {
      setPressed(false);
      textProps?.onPressOut?.(e);
    },
    [textProps],
  );

  return (
    <TDefaultRenderer
      {...props}
      textProps={{
        ...textProps,
        onPressIn,
        onPressOut,
        style: [textProps?.style, pressed && styles.linkPressed],
      }}
    />
  );
};

const buildBaseStyle = (palette: HtmlPalette): MixedStyleDeclaration => ({
  color: palette.text,
  fontSize: 15.5,
  lineHeight: 24,
  fontFamily: 'System',
});

const buildTagsStyles = (
  palette: HtmlPalette,
): Record<string, MixedStyleDeclaration> => ({
  body: {margin: 0, padding: 0},
  p: {marginTop: 0, marginBottom: 12},
  h1: {
    color: palette.heading,
    fontSize: 24,
    lineHeight: 31,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 12,
  },
  h2: {
    color: palette.heading,
    fontSize: 20,
    lineHeight: 27,
    fontWeight: '700',
    marginTop: 18,
    marginBottom: 10,
  },
  h3: {
    color: palette.heading,
    fontSize: 18,
    lineHeight: 25,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  h4: {
    color: palette.heading,
    fontSize: 16,
    lineHeight: 23,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  h5: {
    color: palette.heading,
    fontSize: 15.5,
    lineHeight: 22,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  h6: {
    color: palette.heading,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  strong: {fontWeight: '700'},
  b: {fontWeight: '700'},
  em: {fontStyle: 'italic'},
  i: {fontStyle: 'italic'},
  small: {fontSize: 13, color: palette.muted},
  ul: {marginTop: 2, marginBottom: 12, paddingLeft: 6},
  ol: {marginTop: 2, marginBottom: 12, paddingLeft: 6},
  li: {marginBottom: 5},
  a: {color: palette.link, textDecorationLine: 'none', fontWeight: '500'},
  img: {borderRadius: 12, marginVertical: 12},
  blockquote: {
    borderLeftWidth: 3,
    borderLeftColor: palette.link,
    backgroundColor: palette.surface,
    borderRadius: 8,
    marginVertical: 12,
    marginLeft: 0,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  hr: {
    backgroundColor: palette.border,
    height: StyleSheet.hairlineWidth * 2,
    borderWidth: 0,
    marginVertical: 18,
  },
  code: {
    backgroundColor: palette.codeBackground,
    color: palette.text,
    fontFamily: MONOSPACE_FONT,
    fontSize: 13.5,
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  pre: {
    backgroundColor: palette.codeBackground,
    borderRadius: 10,
    padding: 12,
    marginVertical: 12,
  },
});

const buildClassesStyles = (
  palette: HtmlPalette,
): Record<string, MixedStyleDeclaration> => ({
  'ql-align-center': {textAlign: 'center'},
  'ql-align-right': {textAlign: 'right'},
  'ql-align-justify': {textAlign: 'justify'},
  'text-center': {textAlign: 'center'},
  'text-right': {textAlign: 'right'},
  'text-justify': {textAlign: 'justify'},
  'text-muted': {color: palette.muted},
});

const HtmlRenderer: React.FC<HtmlRendererProps> = ({
  html,
  variant = 'light',
  containerPadding = 16,
  contentWidth,
  style,
}) => {
  const palette = PALETTE[variant];
  const [measuredWidth, setMeasuredWidth] = useState(0);

  const source = useMemo(() => ({html: recoverDoubleEscapedHtml(html || '')}), [html]);
  const baseStyle = useMemo(() => buildBaseStyle(palette), [palette]);
  const tagsStyles = useMemo(() => buildTagsStyles(palette), [palette]);
  const classesStyles = useMemo(() => buildClassesStyles(palette), [palette]);

  const renderWidth =
    contentWidth ?? Math.max(measuredWidth - containerPadding * 2, 0);

  const renderersProps = useMemo(
    () => ({
      a: {
        onPress: (_event: any, url: string) => {
          Linking.openURL(url).catch(() => undefined);
        },
      },
      img: {enableExperimentalPercentWidth: true},
      ul: {markerTextStyle: {color: palette.text}},
      ol: {markerTextStyle: {color: palette.text}},
      table: {
        displayMode: 'embedded' as const,
        style: {
          borderRadius: 12,
          borderWidth: 1,
          borderColor: palette.border,
          marginVertical: 14,
        },
        tableStyleSpecs: {
          fontSizePx: 14,
          cellPaddingEm: 0.6,
          outerBorderColor: palette.border,
          outerBorderWidthPx: 0,
          tdBorderColor: palette.border,
          thBorderColor: palette.border,
          rowsBorderWidthPx: 1,
          columnsBorderWidthPx: 1,
          linkColor: palette.link,
          thOddBackground: palette.tableHeaderBg,
          thEvenBackground: palette.tableHeaderBg,
          thOddColor: palette.heading,
          thEvenColor: palette.heading,
          trOddBackground: 'transparent',
          trEvenBackground: palette.tableRowAltBg,
          trOddColor: palette.text,
          trEvenColor: palette.text,
        },
      },
    }),
    [palette],
  );

  return (
    <View
      style={[styles.container, {paddingHorizontal: containerPadding}, style]}
      onLayout={e => setMeasuredWidth(e.nativeEvent.layout.width)}>
      {renderWidth > 0 && (
        <RenderHTML
          contentWidth={renderWidth}
          source={source}
          systemFonts={SYSTEM_FONTS}
          baseStyle={baseStyle}
          tagsStyles={tagsStyles}
          classesStyles={classesStyles}
          defaultTextProps={DEFAULT_TEXT_PROPS}
          renderersProps={renderersProps}
          renderers={{a: PressableAnchorRenderer, table: TableRenderer}}
          customHTMLElementModels={{table: tableModel}}
          WebView={WebView}
          enableExperimentalMarginCollapsing
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  linkPressed: {
    textDecorationLine: 'underline',
  },
});

export default React.memo(HtmlRenderer);
