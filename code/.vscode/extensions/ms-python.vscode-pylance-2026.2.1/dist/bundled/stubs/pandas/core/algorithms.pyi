from typing import (
    Any,
    Literal,
    overload,
)

from pandas.api.extensions import ExtensionArray
from pandas.core.arrays.categorical import Categorical
from pandas.core.indexes.base import Index
from pandas.core.indexes.category import CategoricalIndex
from pandas.core.indexes.datetimes import DatetimeIndex
from pandas.core.indexes.interval import IntervalIndex
from pandas.core.indexes.multi import MultiIndex
from pandas.core.indexes.period import PeriodIndex
from pandas.core.indexes.range import RangeIndex
from pandas.core.indexes.timedeltas import TimedeltaIndex
from pandas.core.series import Series

from pandas._typing import (
    T_EXTENSION_ARRAY,
    GenericT,
    IntervalT,
    ShapeT,
    TakeIndexer,
    np_1darray,
    np_1darray_int64,
    np_ndarray,
)

# These are type: ignored because the Index types overlap due to inheritance but indices
# with extension types return the same type while standard type return ndarray
@overload
def unique(values: CategoricalIndex) -> CategoricalIndex: ...
@overload
def unique(values: IntervalIndex[IntervalT]) -> IntervalIndex[IntervalT]: ...
@overload
def unique(values: PeriodIndex) -> PeriodIndex: ...
@overload
def unique(values: DatetimeIndex) -> DatetimeIndex: ...
@overload
def unique(values: TimedeltaIndex) -> TimedeltaIndex: ...
@overload
def unique(values: RangeIndex) -> Index[int]: ...
@overload
def unique(values: MultiIndex) -> MultiIndex: ...
@overload
def unique(values: Index) -> Index: ...
@overload
def unique(values: Categorical) -> Categorical: ...

# @overload
# def unique(values: Series[Never]) -> np_1darray | ExtensionArray: ...
# TODO: DatetimeArray python/mypy#19952
# @overload
# def unique(values: Series[Timestamp]) -> np_ndarray_dt | ExtensionArray: ...
# @overload
# def unique(values: Series[int]) -> np_1darray_anyint | ExtensionArray: ...
@overload
def unique(values: Series) -> np_1darray | ExtensionArray: ...
@overload
def unique(values: np_ndarray[ShapeT, GenericT]) -> np_1darray[GenericT]: ...
@overload
def unique(values: T_EXTENSION_ARRAY) -> T_EXTENSION_ARRAY: ...
@overload
def factorize(
    values: np_ndarray[ShapeT, GenericT],
    sort: bool = False,
    use_na_sentinel: bool = True,
    size_hint: int | None = None,
) -> tuple[np_1darray_int64, np_1darray[GenericT]]:
    """
Encode the object as an enumerated type or categorical variable.

This method is useful for obtaining a numeric representation of an
array when all that matters is identifying distinct values. `factorize`
is available as both a top-level function :func:`pandas.factorize`,
and as a method :meth:`Series.factorize` and :meth:`Index.factorize`.

Parameters
----------
values : sequence
    A 1-D sequence. Sequences that aren't pandas objects are
    coerced to ndarrays before factorization.
sort : bool, default False
    Sort `uniques` and shuffle `codes` to maintain the
    relationship.

use_na_sentinel : bool, default True
    If True, the sentinel -1 will be used for NaN values. If False,
    NaN values will be encoded as non-negative integers and will not drop the
    NaN from the uniques of the values.

    .. versionadded:: 1.5.0
size_hint : int, optional
    Hint to the hashtable sizer.

Returns
-------
codes : ndarray
    An integer ndarray that's an indexer into `uniques`.
    ``uniques.take(codes)`` will have the same values as `values`.
uniques : ndarray, Index, or Categorical
    The unique valid values. When `values` is Categorical, `uniques`
    is a Categorical. When `values` is some other pandas object, an
    `Index` is returned. Otherwise, a 1-D ndarray is returned.

    .. note::

       Even if there's a missing value in `values`, `uniques` will
       *not* contain an entry for it.

See Also
--------
cut : Discretize continuous-valued array.
unique : Find the unique value in an array.

Notes
-----
Reference :ref:`the user guide <reshaping.factorize>` for more examples.

Examples
--------
These examples all show factorize as a top-level method like
``pd.factorize(values)``. The results are identical for methods like
:meth:`Series.factorize`.

>>> codes, uniques = pd.factorize(np.array(['b', 'b', 'a', 'c', 'b'], dtype="O"))
>>> codes
array([0, 0, 1, 2, 0])
>>> uniques
array(['b', 'a', 'c'], dtype=object)

With ``sort=True``, the `uniques` will be sorted, and `codes` will be
shuffled so that the relationship is the maintained.

>>> codes, uniques = pd.factorize(np.array(['b', 'b', 'a', 'c', 'b'], dtype="O"),
...                               sort=True)
>>> codes
array([1, 1, 0, 2, 1])
>>> uniques
array(['a', 'b', 'c'], dtype=object)

When ``use_na_sentinel=True`` (the default), missing values are indicated in
the `codes` with the sentinel value ``-1`` and missing values are not
included in `uniques`.

>>> codes, uniques = pd.factorize(np.array(['b', None, 'a', 'c', 'b'], dtype="O"))
>>> codes
array([ 0, -1,  1,  2,  0])
>>> uniques
array(['b', 'a', 'c'], dtype=object)

Thus far, we've only factorized lists (which are internally coerced to
NumPy arrays). When factorizing pandas objects, the type of `uniques`
will differ. For Categoricals, a `Categorical` is returned.

>>> cat = pd.Categorical(['a', 'a', 'c'], categories=['a', 'b', 'c'])
>>> codes, uniques = pd.factorize(cat)
>>> codes
array([0, 0, 1])
>>> uniques
['a', 'c']
Categories (3, object): ['a', 'b', 'c']

Notice that ``'b'`` is in ``uniques.categories``, despite not being
present in ``cat.values``.

For all other pandas objects, an Index of the appropriate type is
returned.

>>> cat = pd.Series(['a', 'a', 'c'])
>>> codes, uniques = pd.factorize(cat)
>>> codes
array([0, 0, 1])
>>> uniques
Index(['a', 'c'], dtype='object')

If NaN is in the values, and we want to include NaN in the uniques of the
values, it can be achieved by setting ``use_na_sentinel=False``.

>>> values = np.array([1, 2, 1, np.nan])
>>> codes, uniques = pd.factorize(values)  # default: use_na_sentinel=True
>>> codes
array([ 0,  1,  0, -1])
>>> uniques
array([1., 2.])

>>> codes, uniques = pd.factorize(values, use_na_sentinel=False)
>>> codes
array([0, 1, 0, 2])
>>> uniques
array([ 1.,  2., nan])
    """
    pass
@overload
def factorize(
    values: Index | Series,
    sort: bool = False,
    use_na_sentinel: bool = True,
    size_hint: int | None = None,
) -> tuple[np_1darray_int64, Index]: ...
@overload
def factorize(
    values: Categorical,
    sort: bool = False,
    use_na_sentinel: bool = True,
    size_hint: int | None = None,
) -> tuple[np_1darray_int64, Categorical]: ...

# The following unpublished function is added to reduce type checking ignores
def value_counts(
    values: np_ndarray,
    sort: bool = True,
    ascending: bool = False,
    normalize: bool = False,
    bins: int | None = None,
    dropna: bool = True,
) -> Series[int]: ...
def take(
    arr: np_ndarray[Any] | ExtensionArray | Index | Series,
    indices: TakeIndexer,
    axis: Literal[0, 1] = 0,
    allow_fill: bool = False,
    fill_value: Any = None,
) -> np_1darray | ExtensionArray: ...
