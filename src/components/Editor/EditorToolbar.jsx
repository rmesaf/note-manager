import ToolbarButton from './ToolbarButton';
import ToolbarSelect from './ToolbarSelect';

/**
 * Toolbar container for Tiptap formatting commands.
 * @description Renders a row of formatting buttons and selects based on a configuration array.
 * Separates UI concerns (which controls to show, their layout) from the editor logic.
 * Supports both button actions and dropdown select actions.
 * @param {Object} props
 * @param {Array<Object>} props.actions - Array of toolbar action definitions.
 *   Button: { onClick, isActive, title, children, separator? }
 *   Select: { type: 'select', title, options, displayValue, buttonIcon }
 * @returns {JSX.Element}
 */
const EditorToolbar = ({ actions }) => {
  return (
    <div className="px-6 border-b border-sand pb-2 mb-4 flex items-center gap-1 flex-wrap">
      {actions.map((action, index) => (
        <div key={index}>
          {action.separator ? (
            <div
              className="w-px h-5 bg-sand mx-1"
              aria-hidden="true"
            />
          ) : action.type === 'select' ? (
            <ToolbarSelect
              title={action.title}
              options={action.options}
              displayValue={action.displayValue}
              buttonIcon={action.buttonIcon}
            />
          ) : (
            <ToolbarButton
              onClick={action.onClick}
              isActive={action.isActive}
              title={action.title}
            >
              {action.children}
            </ToolbarButton>
          )}
        </div>
      ))}
    </div>
  );
};

export default EditorToolbar;
