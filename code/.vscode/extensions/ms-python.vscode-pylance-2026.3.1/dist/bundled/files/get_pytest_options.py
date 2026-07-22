import sys

try:
    from _pytest.config import get_config

    c = get_config()
    # Pytest's Config.parse expects the arguments *excluding* the program name.
    # If we include the script path (sys.argv[0]) it can be interpreted as a test
    # path and alter rootdir/config discovery, causing pytest.ini to be ignored.
    c.parse(sys.argv[1:])
    print(f"Python classes: {c.getini('python_classes')}")
    print(f"Python files: {c.getini('python_files')}")
    print(f"Python functions: {c.getini('python_functions')}")
except Exception as e:
    # When pytest is not installed (or config parsing fails for any other reason),
    # exit cleanly instead of letting the exception propagate. An unhandled
    # traceback is reported by Linux crash handlers such as Fedora's abrt, which
    # spams the system journal even though the caller already falls back to the
    # default pytest discovery patterns when this script fails.
    print(f"Failed to retrieve pytest options: {e}", file=sys.stderr)
    sys.exit(1)
