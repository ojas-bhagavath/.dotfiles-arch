from collections.abc import (
    Collection,
    Hashable,
    Iterable,
    Mapping,
    Sequence,
)
from typing import (
    Any,
    Never,
    Self,
    overload,
)

import numpy as np
import pandas as pd
from pandas.api.typing import FrozenList
from pandas.core.indexes.base import Index

from pandas._typing import (
    AnyAll,
    Axes,
    Dtype,
    HashableT,
    IndexLabel,
    Label,
    Level,
    MaskType,
    NaPosition,
    NumpyNotTimeDtypeArg,
    NumpyTimedeltaDtypeArg,
    NumpyTimestampDtypeArg,
    SequenceNotStr,
    Shape,
    np_1darray_bool,
    np_1darray_int8,
    np_1darray_intp,
    np_ndarray,
    np_ndarray_anyint,
)

class MultiIndex(Index):
    def __new__(
        cls,
        levels: Sequence[SequenceNotStr[Hashable]] | None = None,
        codes: Sequence[Sequence[int]] | None = None,
        sortorder: int | None = None,
        names: SequenceNotStr[Hashable] | None = None,
        copy: bool = False,
        name: None = None,
        verify_integrity: bool = True,
    ) -> Self: ...
    @classmethod
    def from_arrays(
        cls,
        arrays: Sequence[Axes],
        sortorder: int | None = None,
        names: SequenceNotStr[Hashable] | None = None,
    ) -> Self: ...
    @classmethod
    def from_tuples(
        cls,
        tuples: Iterable[tuple[Hashable, ...]],
        sortorder: int | None = None,
        names: SequenceNotStr[Hashable] | None = None,
    ) -> Self: ...
    @overload
    @classmethod
    def from_product(
        cls,
        iterables: Sequence[str],
        sortorder: int | None = None,
        names: SequenceNotStr[Hashable] | None = None,
    ) -> Never: ...
    @overload
    @classmethod
    def from_product(
        cls,
        iterables: Sequence[Iterable[Hashable]],
        sortorder: int | None = None,
        names: SequenceNotStr[Hashable] | None = None,
    ) -> Self: ...
    @classmethod
    def from_frame(
        cls,
        df: pd.DataFrame,
        sortorder: int | None = None,
        names: SequenceNotStr[Hashable] | None = None,
    ) -> Self: ...
    @property  # Should be read-only
    def levels(self) -> FrozenList[Index]: ...
    @overload
    def set_levels(
        self,
        levels: Sequence[SequenceNotStr[Hashable]],
        *,
        level: Sequence[Level] | None = None,
        verify_integrity: bool = True,
    ) -> MultiIndex: ...
    @overload
    def set_levels(
        self,
        levels: SequenceNotStr[Hashable],
        *,
        level: Level,
        verify_integrity: bool = True,
    ) -> MultiIndex: ...
    @property
    def codes(self) -> FrozenList[np_1darray_int8]: ...
    @overload
    def set_codes(
        self,
        codes: Sequence[Sequence[int]],
        *,
        level: Sequence[Level] | None = None,
        verify_integrity: bool = True,
    ) -> MultiIndex: ...
    @overload
    def set_codes(
        self,
        codes: Sequence[int],
        *,
        level: Level,
        verify_integrity: bool = True,
    ) -> MultiIndex: ...
    def copy(  # type: ignore[override] # pyright: ignore[reportIncompatibleMethodOverride] # pyrefly: ignore # ty: ignore[invalid-method-override]
        self, names: SequenceNotStr[Hashable] | None = None, deep: bool = False
    ) -> Self: ...
    def view(self, cls: NumpyNotTimeDtypeArg | NumpyTimedeltaDtypeArg | NumpyTimestampDtypeArg | type[np_ndarray] | None = None) -> MultiIndex: ...  # type: ignore[override] # pyrefly: ignore[bad-override] # pyright: ignore[reportIncompatibleMethodOverride] # ty: ignore[invalid-method-override]
    @property
    def dtype(self) -> np.dtype: ...
    @property
    def dtypes(self) -> pd.Series[Dtype]: ...
    def memory_usage(self, deep: bool = False) -> int: ...
    @property
    def nbytes(self) -> int: ...
    def __len__(self) -> int: ...
    @property
    def is_monotonic_increasing(self) -> bool: ...
    @property
    def is_monotonic_decreasing(self) -> bool: ...
    def dropna(self, how: AnyAll = "any") -> Self:
        """
Return Index without NA/NaN values.

Parameters
----------
how : {'any', 'all'}, default 'any'
    If the Index is a MultiIndex, drop the value when any or all levels
    are NaN.

Returns
-------
Index

Examples
--------
>>> idx = pd.Index([1, np.nan, 3])
>>> idx.dropna()
Index([1.0, 3.0], dtype='float64')
        """
        pass
    def droplevel(self, level: Level | Sequence[Level] = 0) -> MultiIndex | Index: ...  # type: ignore[override] # pyrefly: ignore[bad-override]
    def get_level_values(self, level: str | int) -> Index: ...
    @overload  # type: ignore[override]
    def unique(  # pyrefly: ignore[bad-override]
        self, level: None = None
    ) -> MultiIndex:
        """
Return unique values in the index.

Unique values are returned in order of appearance, this does NOT sort.

Parameters
----------
level : int or hashable, optional
    Only return values from specified level (for MultiIndex).
    If int, gets the level by integer position, else by level name.

Returns
-------
Index

See Also
--------
unique : Numpy array of unique values in that column.
Series.unique : Return unique values of Series object.

Examples
--------
>>> idx = pd.Index([1, 1, 2, 3, 3])
>>> idx.unique()
Index([1, 2, 3], dtype='int64')
        """
        pass
    @overload
    def unique(  # ty: ignore[invalid-method-override]  # pyright: ignore[reportIncompatibleMethodOverride]
        self, level: Level
    ) -> Index: ...
    def to_frame(  # type: ignore[override] # pyright: ignore[reportIncompatibleMethodOverride] # pyrefly: ignore[bad-override] # ty: ignore[invalid-method-override]
        self,
        index: bool = True,
        name: list[HashableT] = ...,
        allow_duplicates: bool = False,
    ) -> pd.DataFrame: ...
    def to_flat_index(self) -> Index: ...
    def remove_unused_levels(self) -> MultiIndex: ...
    @property
    def nlevels(self) -> int: ...
    @property
    def levshape(self) -> Shape: ...
    @overload  # type: ignore[override]
    def __getitem__(  # pyrefly: ignore[bad-override]
        self,
        idx: slice | np_ndarray_anyint | Sequence[int] | Index | MaskType,
    ) -> Self: ...
    @overload
    def __getitem__(  # pyright: ignore[reportIncompatibleMethodOverride] # ty: ignore[invalid-method-override]
        self, key: int
    ) -> tuple[Hashable, ...]: ...
    @overload  # type: ignore[override]
    def append(self, other: MultiIndex | Sequence[MultiIndex]) -> MultiIndex: ...
    @overload
    def append(  # pyright: ignore[reportIncompatibleMethodOverride]
        self, other: Index | Sequence[Index]
    ) -> Index: ...
    def drop(self, codes: Level | Sequence[Level], level: Level | None = None, errors: str = "raise") -> MultiIndex: ...  # type: ignore[override] # pyright: ignore[reportIncompatibleMethodOverride] # pyrefly: ignore[bad-override] # ty: ignore[invalid-method-override]
    def swaplevel(self, i: int = -2, j: int = -1) -> Self: ...
    def reorder_levels(self, order: Sequence[Level]) -> MultiIndex: ...
    def sortlevel(
        self,
        level: Level | Sequence[Level] = 0,
        ascending: bool = True,
        sort_remaining: bool = True,
        na_position: NaPosition = "first",
    ) -> tuple[MultiIndex, np_1darray_intp]: ...
    def get_loc_level(
        self,
        key: Label | Sequence[Label],
        level: Level | Sequence[Level] | None = None,
        drop_level: bool = True,
    ) -> tuple[int | slice | np_1darray_bool, Index]: ...
    def get_locs(self, seq: Level | Sequence[Level]) -> np_1darray_intp: ...
    def truncate(
        self, before: IndexLabel | None = None, after: IndexLabel | None = None
    ) -> MultiIndex: ...
    @overload  # type: ignore[override]
    def isin(  # pyrefly: ignore[bad-override]
        self, values: Iterable[Any], level: Level
    ) -> np_1darray_bool:
        """
Return a boolean array where the index values are in `values`.

Compute boolean array of whether each index value is found in the
passed set of values. The length of the returned boolean array matches
the length of the index.

Parameters
----------
values : set or list-like
    Sought values.
level : str or int, optional
    Name or position of the index level to use (if the index is a
    `MultiIndex`).

Returns
-------
np.ndarray[bool]
    NumPy array of boolean values.

See Also
--------
Series.isin : Same for Series.
DataFrame.isin : Same method for DataFrames.

Notes
-----
In the case of `MultiIndex` you must either specify `values` as a
list-like object containing tuples that are the same length as the
number of levels, or specify `level`. Otherwise it will raise a
``ValueError``.

If `level` is specified:

- if it is the name of one *and only one* index level, use that level;
- otherwise it should be a number indicating level position.

Examples
--------
>>> idx = pd.Index([1,2,3])
>>> idx
Index([1, 2, 3], dtype='int64')

Check whether each index value in a list of values.

>>> idx.isin([1, 4])
array([ True, False, False])

>>> midx = pd.MultiIndex.from_arrays([[1,2,3],
...                                  ['red', 'blue', 'green']],
...                                  names=('number', 'color'))
>>> midx
MultiIndex([(1,   'red'),
            (2,  'blue'),
            (3, 'green')],
           names=['number', 'color'])

Check whether the strings in the 'color' level of the MultiIndex
are in a list of colors.

>>> midx.isin(['red', 'orange', 'yellow'], level='color')
array([ True, False, False])

To check across the levels of a MultiIndex, pass a list of tuples:

>>> midx.isin([(1, 'red'), (3, 'red')])
array([ True, False, False])
        """
        pass
    @overload
    def isin(  # ty: ignore[invalid-method-override] # pyright: ignore[reportIncompatibleMethodOverride]
        self, values: Collection[Iterable[Any]], level: None = None
    ) -> np_1darray_bool: ...
    def set_names(
        self,
        names: Hashable | Sequence[Hashable] | Mapping[Any, Hashable],
        *,
        level: Level | Sequence[Level] | None = None,
        inplace: bool = False,
    ) -> Self: ...
